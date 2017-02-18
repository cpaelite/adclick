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
    keys
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

async function normalReport(query) {
  let { userId, where, from, to, tz, groupBy, offset, limit, filter, order, status } = query;
  if (filter) {
      where[groupByTag[groupBy][2]] = {
          $like: `%${filter}%`
      }
  }
  where.UserID = userId
  where.Timestamp = sequelize.and(sequelize.literal(`AdStatis.Timestamp >= (UNIX_TIMESTAMP(CONVERT_TZ('${from}', '+00:00','${tz}')) * 1000)`), sequelize.literal(`AdStatis.Timestamp <= (UNIX_TIMESTAMP(CONVERT_TZ('${to}', '+00:00','${tz}')) * 1000)`));
  let include = _.values(groupByModel).map(e => {
      let _r = {
          model: models[e]
      }
      if (e === groupByModel[groupBy] && (status === "0" || status === "1")) {
          _r.where = {
              deleted: status
          }
      } else {
          _r.required = false
      }
      return _r;
  })

  let orderBy = ['campaignId', 'ASC']

  if (order) {
      if (order[0] === '-') {
          orderBy[1] = 'DESC'
          order = order.slice(1)
      }
      if (sumShorts[order]) {
          orderBy[0] = sumShorts[order][0]
      } else {
          orderBy[0] = order
      }
  }

  let rows = await models.AdStatis.findAll({
      where,
      limit,
      offset,
      include,
      attributes,
      group: `AdStatis.${mapping[groupBy]}`,
      order: [orderBy]
  })

  let totalRows = rows.length;

  let totals = {
      impressions: rows.reduce((sum, row) => sum + row.dataValues.impressions, 0),
      clicks: rows.reduce((sum, row) => sum + row.dataValues.clicks, 0),
      visits: rows.reduce((sum, row) => sum + row.dataValues.visits, 0)
  }
  return {rows, totals, totalRows}
}

async function listPageReport(query) {
    let { userId, where, from, to, tz, groupBy, offset, limit, filter, order, status } = query;

    let nr = await normalReport(query);
    let Tag = groupByTag[groupBy][0]
    let Name = groupByTag[groupBy][1]

    let _where = {
      userId,
      id: {
          $notIn: nr.rows.length === 0
              ? [-1]
              : nr.rows.map((e) => e.dataValues[Tag])
      }
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

    var placeholders = []

    if (limit > nr.rows.length) {

        placeholders = await models[groupByModel[groupBy]].findAll({
            attributes: [
                [
                    'id', Tag
                ],
                ['name', Name]
            ],
            limit: (limit - nr.rows.length),
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

    }


    return {
        totals: nr.totals,
        totalRows,
        rows: [
            ...nr.rows,
            ...placeholders
        ]
    }
}

module.exports = router;
