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

router.get('/api/report', async function(req, res, next) {
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
    if (limit < 0)
        limit = 10000
    page = parseInt(page)
    let offset = (page - 1) * limit;
    let attrs = Object.keys(value);
    _.forEach(attrs, (attr) => {
        if (mapping[attr]) {
            sqlWhere[mapping[attr]] = value[attr];
        }
    })
    let isListPageRequest = Object.keys(sqlWhere).length === 0 && groupByMapping[groupBy]
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
        return normalReport({where: sqlWhere, from, to, tz, groupBy, offset, limit, filter})
    }

}

async function fullfill({rows, groupBy}) {
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

  for(let i = 0; i < rawForeignRows.length; i++) {
    let rawForeignRow = rawForeignRows[i];
    for(let j = 0; j < totalRows; j++) {
      let rawRow = rawRows[j];
      if (rawRow[foreignConfig.foreignKey] === rawForeignRow.id) {
        let keys = Object.keys(rawForeignRow);
        keys.forEach(key => {
          if (key === 'id') return;
          rawRow[key] = rawForeignRow[key]
        })
      }
    }
  }
  return rows;
}

async function normalReport(query) {
  let { userId, where, from, to, tz, groupBy, offset, limit, filter, order, status } = query;
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

  let rows = await models.AdStatis.findAll({
      where,
      limit,
      offset,
      attributes,
      group: `AdStatis.${mapping[groupBy]}`,
      order: [orderBy]
  })

  rows = await fullfill({rows, groupBy})
  let totalRows = rows.length;

  let totals = {
      impressions: rows.reduce((sum, row) => sum + row.impressions, 0),
      clicks: rows.reduce((sum, row) => sum + row.clicks, 0),
      visits: rows.reduce((sum, row) => sum + row.visits, 0)
  }
  return {rows, totals, totalRows}
}

async function listPageReport(query) {
    let { userId, where, from, to, tz, groupBy, offset, limit, filter, order, status } = query;
    let nr = await normalReport(query);

    let Tag = groupByTag[groupBy][0]
    let Name = groupByTag[groupBy][1]

    let foreignConfig = extraConfig(groupBy);

    let _where = {
      userId,
      id: { $notIn: nr.rows.length === 0 ? [-1] : nr.rows.map((e) => e[Tag])}
    }
    if (filter) {
      _where.name = { $like: `%${filter}%`}
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

    let finalRows = formatRows([
        ...(nr.rows).map(row => row.dataValues),
        ...placeholders
    ])



    return {
        totals: nr.totals,
        totalRows,
        rows: finalRows
    }
}

module.exports = router;
