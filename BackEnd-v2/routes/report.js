import express from 'express';
var router = express.Router();
var common = require('./common');
import _ from 'lodash';
import sequelize from 'sequelize';
import {
  mapping,
  sumShorts,
  attributes,
  nunberColumnForListPage,
  formatRows,
  formatTotals,
  extraConfig
} from '../util/report'

/**
 * @api {get} /api/report  报表
 * @apiName  报表
 * @apiGroup report
 * @apiDescription  报表
 *
 */

//from   to tz  sort  direction columns=[]  groupBy  offset   limit  filter1  filter1Value  filter2 filter2Value

router.get('/api/report', async function (req, res, next) {
  req.query.userId = req.parent.id;
  try {
    let result;
    result = await campaignReport(req.query);
    return res.json({status: 1, message: 'success', data: result});
  } catch (e) {
    console.error(e)
    return next(e);
  }

});

async function campaignReport(value) {
  let {groupBy, limit, page} = value;
  // init values
  if (!mapping[groupBy]) {
    //TODO: unsupport group
  }
  // limit
  limit = parseInt(limit)
  if (!limit || limit < 0)
    limit = 1000
  value.limit = limit
  // offset
  page = parseInt(page)
  let offset = (page - 1) * limit;
  if (!offset)
    offset = 0
  value.offset = offset


  console.info("------------", isListPageRequest(value))
  if (isListPageRequest(value)) {
    console.info("list page process")
    return listPageReport(value)
  } else {
    console.info("normal process")
    return normalReport(value)
  }
}

function isListPageRequest(value) {
  let {groupBy} = value
  let _flag = !!mapping[groupBy].listPage
  let isListPageRequest = !hasFilter(value) && _flag
  return isListPageRequest
}

function hasFilter(value) {
  let attrs = Object.keys(value);
  _.forEach(attrs, (attr) => {
    if (mapping[attr]) {
      return true
    }
  })
  return
}

async function fullFill({rawRows, groupBy}) {
  if (!mapping[groupBy].table) {
    // don't belong to group by model, do nothing
    return rawRows
  }
  let foreignConfig = extraConfig(groupBy);
  let foreignKeys = rawRows.map(r => r[foreignConfig.foreignKey]);
  let foreignRows = await models[mapping[groupBy].table].findAll({
    where: {
      id: foreignKeys
    },
    attributes: foreignConfig.attributes
  })
  let rawForeignRows = foreignRows.map(e => e.dataValues);

  let totalRows = rawRows.length;

  for (let i = 0; i < rawForeignRows.length; i++) {
    let rawForeignRow = rawForeignRows[i];
    for (let j = 0; j < totalRows; j++) {
      let rawRow = rawRows[j];
      if (rawRow[foreignConfig.foreignKey] === rawForeignRow.id) {
        let keys = Object.keys(rawForeignRow);
        keys.forEach(key => {
          if (key === 'id') return;
          rawRow[key] = rawForeignRow[key]
        })
        break;
      }
    }
  }
  return rawRows;
}

async function normalReport(values) {
  let {userId, from, to, tz, groupBy, offset, limit, filter, order, status} = values;

  let sqlWhere = {};
  sqlWhere.UserID = userId
  sqlWhere.Timestamp = sequelize.and(sequelize.literal(`AdStatis.Timestamp >= (UNIX_TIMESTAMP(CONVERT_TZ('${from}','${tz}', '+00:00')) * 1000)`), sequelize.literal(`AdStatis.Timestamp <= (UNIX_TIMESTAMP(CONVERT_TZ('${to}','${tz}', '+00:00')) * 1000)`));

  let attrs = Object.keys(values);
  _.forEach(attrs, (attr) => {
    if (attr === 'day') {
      sqlWhere.Timestamp = sequelize.and(
        sequelize.literal(`AdStatis.Timestamp >= (UNIX_TIMESTAMP(CONVERT_TZ('${values.day.trim()}T00:00','${tz}', '+00:00')) * 1000)`),
        sequelize.literal(`AdStatis.Timestamp <= (UNIX_TIMESTAMP(CONVERT_TZ('${values.day.trim()}T23:59','${tz}', '+00:00')) * 1000)`)
      );
    } else if (mapping[attr]) {
      sqlWhere[mapping[attr].dbKey] = values[attr];
    }
  })

  if (filter) {
    sqlWhere[mapping[groupBy].dbFilter] = {
      $like: `%${filter}%`
    }
  }

  let orderBy = ['UserID', 'ASC']

  if (order) {
    if (order[0] === '-') {
      orderBy[1] = 'DESC'
      order = order.slice(1)
    }
    if (sumShorts[order]) {
      orderBy[0] = sumShorts[order][0]
    }
  }

  // group by day
  let finalAttribute = attributes
  if (groupBy.toLowerCase() === 'day') {
    finalAttribute = [[sequelize.literal('DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((Timestamp/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL 8 HOUR), "%Y-%m-%d")'), 'day'], ...attributes]
  }

  console.info(sqlWhere)
  let rows = await models.AdStatis.findAll({
    where: sqlWhere,
    limit,
    offset,
    attributes: finalAttribute,
    group: `${mapping[groupBy].dbGroupBy}`,
    order: [orderBy]
  })
  let rawRows = rows.map(e => e.dataValues);
  rawRows = await fullFill({rawRows, groupBy})
  rawRows = formatRows(rawRows)
  let totalRows = rawRows.length;
  let totals = {
    impressions: rawRows.reduce((sum, row) => sum + row.impressions, 0),
    clicks: rawRows.reduce((sum, row) => sum + row.clicks, 0),
    visits: rawRows.reduce((sum, row) => sum + row.visits, 0),
    conversions: rawRows.reduce((sum, row) => sum + row.conversions, 0),
    revenue: rawRows.reduce((sum, row) => sum + row.revenue, 0),
    cost: rawRows.reduce((sum, row) => sum + row.cost, 0),
    profit: rawRows.reduce((sum, row) => sum + row.profit, 0),
    cpv: rawRows.reduce((sum, row) => sum + row.cost, 0) / rawRows.reduce((sum, row) => sum + row.visits, 0),
    ictr: rawRows.reduce((sum, row) => sum + row.visits, 0) / rawRows.reduce((sum, row) => sum + row.impression, 0),
    ctr: rawRows.reduce((sum, row) => sum + row.clicks, 0) / rawRows.reduce((sum, row) => sum + row.visits, 0),
    cr: rawRows.reduce((sum, row) => sum + row.conversions, 0) / rawRows.reduce((sum, row) => sum + row.clicks, 0),
    cv: rawRows.reduce((sum, row) => sum + row.conversions, 0) / rawRows.reduce((sum, row) => sum + row.visits, 0),
    // roi: (rawRows.reduce((sum, row) => sum + row.revenue, 0) - rawRows.reduce((sum, row) => sum + row.cost, 0)) / rawRows.reduce((sum, row) => sum + row.cost),
    epv: rawRows.reduce((sum, row) => sum + row.revenue, 0) / rawRows.reduce((sum, row) => sum + row.visits, 0),
    epc: rawRows.reduce((sum, row) => sum + row.revenue, 0) / rawRows.reduce((sum, row) => sum + row.clicks, 0),
    ap: rawRows.reduce((sum, row) => sum + row.revenue, 0) / rawRows.reduce((sum, row) => sum + row.conversions, 0),
  }
  totals.roi = totals.profit / totals.cost
  totals = formatTotals([totals])[0]
  return {rows: rawRows, totals, totalRows}
}

async function listPageReport(query) {
  let {userId, groupBy, filter, order, status} = query;
  let nr = await normalReport(query);
  let foreignConfig = extraConfig(groupBy);
  let _where = {
    userId,
  }
  if (groupBy === 'flow') {
    _where['type'] = {ne: 0}
  }
  if (filter) {
    _where.name = {$like: `%${filter}%`}
  }
  if (status === "0") {
    _where.deleted = "1";
  } else if (status === "1") {
    _where.deleted = "0";
  }

  let totalRows = await models[mapping[groupBy].table].count({where: _where});

  let listData = await models[mapping[groupBy].table].findAll({
    attributes: foreignConfig.attributes,
    where: _where
  })

  listData = listData.map((e) => {
    let obj = e.dataValues;
    nunberColumnForListPage.forEach(key => {
        obj[key] = 0;
      }
    );
    return obj;
  })

  for (let i = 0; i < nr.rows.length; i++) {
    let rawForeignRow = nr.rows[i];
    for (let j = 0; j < listData.length; j++) {
      let rawRow = listData[j];
      if (rawForeignRow[foreignConfig.foreignKey] === rawRow.id) {
        let keys = Object.keys(rawForeignRow);
        keys.forEach(key => {
          if (key === 'id') return;
          rawRow[key] = rawForeignRow[key]
        })
        break;
      }

    }
  }
  if (order) {
    listData.sort(dynamicSort(order));
  }
  return {
    totals: nr.totals,
    totalRows,
    rows: listData
  }
}

function dynamicSort(property) {
  var sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}

module.exports = router;
