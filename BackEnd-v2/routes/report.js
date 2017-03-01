import express from 'express';
var router = express.Router();
var common = require('./common');
import moment from 'moment-timezone';
import _ from 'lodash';
import sequelize from 'sequelize';
import {
  mapping,
  groupByMapping,
  groupByModel,
  groupByTag,
  sumShorts,
  attributes,
  keys,
  formatRows,
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
  req.query.userId = req.userId;
  try {
    let result;
    result = await campaignReport(req.query);
    return res.json({status: 1, message: 'success', data: result});
  } catch (e) {
    return next(e);
  }

});

async function campaignReport(value) {
  let {
    groupBy,
    limit,
    page,
    from,
    to,
    tz,
    filter,
    order,
    status
  } = value;

  let sqlWhere = {};
  limit = parseInt(limit)
  if (!limit || limit < 0)
    limit = 10000
  page = parseInt(page)
  let offset = (page - 1) * limit;
  if (!offset)
    offset = 0
  let attrs = Object.keys(value);
  _.forEach(attrs, (attr) => {
    if (mapping[attr]) {
      sqlWhere[mapping[attr]] = value[attr];
    }
  })
  let _flag = !!groupByMapping[groupBy]
  let isListPageRequest = Object.keys(sqlWhere).length === 0 && _flag
  console.info("------------------------", isListPageRequest)
  if (isListPageRequest) {
    return listPageReport({
      userId: value.userId,
      where: sqlWhere,
      from,
      to,
      tz,
      groupBy,
      offset,
      limit,
      filter,
      order,
      status
    })
  } else {
    return normalReport({userId: value.userId, where: sqlWhere, from, to, tz, groupBy, offset, limit, filter})
  }

}

async function fullFill({rows, groupBy}) {
  if (!groupByModel[groupBy]) {
    // don't belong to group by model, do nothing
    return rows
  }
  let rawRows = rows.map(e => e.dataValues);
  let foreignConfig = extraConfig(groupBy);
  let foreignKeys = rows.map(r => r.dataValues[foreignConfig.foreignKey]);
  let foreignRows = await models[groupByModel[groupBy]].findAll({
    where: {
      id: foreignKeys
    },
    attributes: foreignConfig.attributes
  })
  let rawForeignRows = foreignRows.map(e => e.dataValues);

  let totalRows = rows.length;

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
  return rows;
}

async function normalReport(query) {
  let {userId, where, from, to, tz, groupBy, offset, limit, filter, order, status} = query;
  if (filter) {
    where[groupByTag[groupBy][2]] = {
      $like: `%${filter}%`
    }
  }
  where.UserID = userId
  where.Timestamp = sequelize.and(sequelize.literal(`AdStatis.Timestamp >= (UNIX_TIMESTAMP(CONVERT_TZ('${from}','${tz}', '+00:00')) * 1000)`), sequelize.literal(`AdStatis.Timestamp <= (UNIX_TIMESTAMP(CONVERT_TZ('${to}','${tz}', '+00:00')) * 1000)`));

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

  let rows = await models.AdStatis.findAll({
    where,
    limit,
    offset,
    attributes: finalAttribute,
    group: `${mapping[groupBy]}`,
    order: [orderBy]
  })

  rows = await fullFill({rows, groupBy})
  let totalRows = rows.length;

  let totals = {
    impressions: rows.reduce((sum, row) => sum + row.dataValues.impressions, 0),
    clicks: rows.reduce((sum, row) => sum + row.dataValues.clicks, 0),
    visits: rows.reduce((sum, row) => sum + row.dataValues.visits, 0),
    conversions: rows.reduce((sum, row) => sum + row.dataValues.conversions, 0),
    revenue: rows.reduce((sum, row) => sum + row.dataValues.revenue, 0)/1000000,
    cost: rows.reduce((sum, row) => sum + row.dataValues.cost, 0)/1000000,
    profit: rows.reduce((sum, row) => sum + row.dataValues.profit, 0)/1000000,
  }
  return {rows, totals, totalRows}
}

async function listPageReport(query) {
  let {userId, where, from, to, tz, groupBy, offset, limit, filter, order, status} = query;

  let nr = await normalReport(query);
  let Tag = groupByTag[groupBy][0]
  console.info("-----------", Tag)
  let Name = groupByTag[groupBy][1]

  let foreignConfig = extraConfig(groupBy);

  let _where = {
    userId,
    // id: {$notIn: nr.rows.length === 0 ? [-1] : nr.rows.map((e) => e.dataValues[Tag])}
  }
  if (filter) {
    _where.name = {$like: `%${filter}%`}
  }
  if (status === "0") {
    _where.deleted = "1";
  } else if (status === "1") {
    _where.deleted = "0";
  }

  let totalRows = await models[groupByModel[groupBy]].count({where: _where});

  let placeholders = await models[groupByModel[groupBy]].findAll({
    attributes: foreignConfig.attributes,
    where: _where
  })

  placeholders = placeholders.map((e) => {
    let obj = e.dataValues;
    keys.forEach(key => {
        if (key !== Tag && key !== Name)
          obj[key] = 0;
      }
    );
    return obj;
  })

  for (let i = 0; i < nr.rows.length; i++) {
    let rawForeignRow = nr.rows[i].dataValues;
    for (let j = 0; j < placeholders.length; j++) {
      let rawRow = placeholders[j];
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
  let finalRows = formatRows(
    placeholders
  )
  return {
    totals: nr.totals,
    totalRows,
    rows: finalRows
  }
}

module.exports = router;
