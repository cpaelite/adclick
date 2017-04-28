import express from 'express';
var router = express.Router();
var common = require('./common');
var moment = require('moment');
var json2csv = require('json2csv');
var Joi = require('joi');
import _ from 'lodash';
import sequelize from 'sequelize';
import {
  mapping,
  sumShorts,
  nunberColumnForListPage,
  formatRows,
  formatTotals,
  extraConfig,
  csvextraConfig,
  csvCloums,
  groupByKeys
} from '../util/report'

/**
 * @api {get} /api/report  报表
 * @apiName  报表
 * @apiGroup report
 * @apiDescription  报表
 *
 */

//from   to tz  sort  direction  ]  groupBy  offset   limit  filter1  filter1Value  filter2 filter2Value
//dataType csv   columns=offerName,offerHash
router.get('/api/report', async function(req, res, next) {
  req.query.userId = req.parent.id;
  try {
    let result;
    if (req.query.groupBy && req.query.groupBy == "ip") {
      result = await IPReport(req);
    } else {
      result = await main_report(req.query);
    }
    return res.json({
      status: 1,
      message: 'success',
      data: result
    });
  } catch (e) {
    console.error(e)
    return next(e);
  }
});

router.get('/api/export', async function(req, res, next) {
  req.query.userId = req.parent.id;
  try {
    let result;
    let fieldsCol = [];
    if (req.query.groupBy) {
      fieldsCol.push(req.query.groupBy);
    }
    req.query.dataType = "csv";
    if (req.query.groupBy && req.query.groupBy == "ip") {
      result = await IPReport(req);
    } else {
      result = await main_report(req.query);
    }
    let rawRows = result.rows;
    //特殊处理ip 导出不fullfill
    // if (req.query.groupBy && req.query.groupBy == "ip") {
    //   let campaign = await getUserCampainByID(req.query.userId, req.query.campaign);
    //   res.setHeader('Content-Disposition', `attachment;filename="NewBidder-${campaign.name}-${campaign.hash}-${moment().unix()}.csv"`);
    // } else {
    // let csvFullfill = [];//缓存csv 要fullfill的关系数据
    // let attrs = Object.keys(req.query);
    // _.forEach(attrs, (attr) => {
    //   if (mapping[attr]) {
    //     let mapKey = {}
    //     mapKey['group'] = mapping[attr].group;
    //     csvFullfill.push(mapKey)
    //   }
    // });

    // for (let index = 0; index < csvFullfill.length; index++) {
    //   rawRows = await csvfullFill({ rawRows, groupBy: csvFullfill[index].group });
    //   for (let j = 0; j < csvCloums(csvFullfill[index].group).length; j++) {
    //     fieldsCol.push(csvCloums(csvFullfill[index].group)[j]);
    //   }
    // }
    //res.setHeader('Content-Disposition', `attachment;filename="NewBidder-${req.query.groupBy}-${moment().unix()}.csv"`);
    // }

    if (req.query.campaign) {
      let campaign = await getUserCampainByID(req.query.userId, req.query.campaign);
      res.setHeader('Content-Disposition', `attachment;filename="NewBidder-${campaign.name}-${campaign.hash}-${moment().unix()}.csv"`);
    } else {
      res.setHeader('Content-Disposition', `attachment;filename="NewBidder-${req.query.groupBy}-${moment().unix()}.csv"`);
    }


    let queryClo = req.query.columns ? req.query.columns.split(',') : [];
    let fields = _.union(fieldsCol, queryClo);

    let csvData = json2csv({
      data: rawRows,
      fields: fields
    });
    res.setHeader('Content-Type', 'text/csv;header=present;charset=utf-8');
    res.setHeader('Expires', '0');
    res.setHeader('Cache-Control', 'must-revalidate');
    return res.send(csvData);
  } catch (e) {
    console.error(e)
    return next(e);
  }
})


async function getUserCampainByID(userid, id) {
  let connection;
  try {
    connection = await common.getConnection();
    let [campaign] = await common.query('select `name`,`hash` from TrackingCampaign where userId=? and id=?', [userid, id], connection);
    return campaign;
  } catch (e) {
    throw e;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function main_report(value) {
  let {
    groupBy,
    limit,
    page
  } = value;
  // init values
  if (!mapping[groupBy]) {
    //TODO: unsupport group
  }
  if (limit && page) {
    // limit
    limit = parseInt(limit);
    value.limit = limit;
    // offset
    page = parseInt(page);
    let offset = (page - 1) * limit;
    if (!offset || offset < 0) offset = 0;
    value.offset = offset;
  }


  console.info("------------", isListPageRequest(value))
  if (isListPageRequest(value)) {
    console.info("list page process")
    return listPageReport(value)
  } else {
    console.info("normal process")
    return normalReport(value, true)
  }
}

function isListPageRequest(value) {
  let {
    groupBy
  } = value
  let _flag = !!mapping[groupBy].listPage
  let isListPageRequest = !hasFilter(value) && _flag
  return isListPageRequest
}

function hasFilter(value) {
  let attrs = Object.keys(value);
  let f = false
  _.forEach(attrs, (attr) => {
    if (mapping[attr]) {
      f = true
    }
  })
  return f
}

async function fullFill({
  rawRows,
  groupBy
}) {
  if (!mapping[groupBy].table) {
    // don't belong to group by model, do nothing
    return rawRows
  }
  let foreignConfig = extraConfig(groupBy);
  let foreignKeys = [];
  for (let index = 0; index < rawRows.length; index++) {
    //bugfix NB-479 rawRows[index][foreignConfig.foreignKey] == 0 说明是directLink
    if (rawRows[index][foreignConfig.foreignKey] == 0) {
      if (foreignConfig.directlink) {
        rawRows[index] = _.assign(rawRows[index], foreignConfig.directlink);
      }
    } else {
      foreignKeys.push(rawRows[index][foreignConfig.foreignKey]);
    }
  }

  if (foreignKeys.length) {
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
        if (rawRow[foreignConfig.foreignKey] == rawForeignRow.id) {
          let keys = Object.keys(rawForeignRow);
          keys.forEach(key => {
            if (key == 'id') return;
            rawRow[key] = rawForeignRow[key]
          })
          break;
        }
      }
    }
  }
  return rawRows;
}

async function csvfullFill({
  rawRows,
  groupBy
}) {
  if (!mapping[groupBy].table) {
    // don't belong to group by model, do nothing
    return rawRows
  }

  let foreignConfig = csvextraConfig(groupBy);
  let foreignKeys = rawRows.map(r => r[foreignConfig.foreignKey]);
  let foreignRows = await models[mapping[groupBy].table].findAll({
    where: {
      id: foreignKeys
    },
    attributes: foreignConfig.attributes
  });
  let rawForeignRows = foreignRows.map(e => e.dataValues);
  let results = [];
  for (let index = 0; index < rawRows.length; index++) {
    results.push(_.assign(rawRows[index], rawForeignRows[0]))
  }
  return results;
}


async function normalReport(values, mustPagination) {
  let {
    userId,
    from,
    to,
    tz,
    groupBy,
    offset,
    limit,
    filter,
    order,
    status
  } = values;
  //====== start 
  let having = "";
  let where = `Timestamp>= (UNIX_TIMESTAMP(CONVERT_TZ('${from}','${tz}', '+00:00')) * 1000) and Timestamp < (UNIX_TIMESTAMP(CONVERT_TZ('${to}','${tz}', '+00:00')) * 1000)`;

  let attrs = Object.keys(values);
  _.forEach(attrs, (attr) => {
    if (attr == 'day') {
      let start = moment(values.day.trim()).startOf('day').format("YYYY-MM-DDTHH:mm:ss");
      let end = moment(values.day.trim()).add(1, 'd').startOf('day').format("YYYY-MM-DDTHH:mm:ss");
      where = ` Timestamp >= (UNIX_TIMESTAMP(CONVERT_TZ('${start}','${tz}', '+00:00')) * 1000) and Timestamp < (UNIX_TIMESTAMP(CONVERT_TZ( '${end}','${tz}', '+00:00')) * 1000)`;
    } else if (attr == 'hour') {
      let start = moment(values.hour.trim()).startOf('hour').format("YYYY-MM-DDTHH:mm:ss");
      let end = moment(values.hour.trim()).add(1, 'hours').startOf('hour').format("YYYY-MM-DDTHH:mm:ss");
      where = ` Timestamp >= (UNIX_TIMESTAMP(CONVERT_TZ('${start}','${tz}', '+00:00')) * 1000) and Timestamp < (UNIX_TIMESTAMP(CONVERT_TZ( '${end}','${tz}', '+00:00')) * 1000)`;
    } else if (mapping[attr]) {
      where += ` and ${[mapping[attr].dbKey]} = '${values[attr]}'`;
    }
  });


  //TODO 不应该数据表模糊查询
  if (filter) {
    //单独处理group by day
    if (groupBy == 'day' || groupBy == 'hour') {
      having = `having ${mapping[groupBy].dbFilter} like '%${filter}%'`;
    } else {
      where += ` and ${mapping[groupBy].dbFilter} like '%${filter}%'`
    }
  }

  let orders = "";
  if (order && mustPagination) {
    if (order.slice(0, 1) == '-') {
      orders = ` order by ${order.slice(1)} DESC`;
    } else {
      orders = ` order by ${order} ASC`;
    }
  }

  let column = `sum(Visits) as visits,
                sum(Impressions) as impressions ,
                round(sum(Revenue/1000000),2) as revenue,
                sum(Clicks) as clicks,
                sum(Conversions) as conversions ,
                round(sum(Cost/1000000),2) as cost ,
                round(sum(Revenue / 1000000 - Cost / 1000000),2) as profit ,
                round(sum(Cost / 1000000) / sum(Visits),4) as cpv,
                round(sum(Visits)/sum(Impressions)*100,2)  as  ictr,
                IFNULL(round(sum(Clicks)/sum(Visits)*100,2),0) as ctr,
                IFNULL(round(sum(Conversions)/sum(Clicks)*100,4),0) as  cr,
                IFNULL(round(sum(Conversions)/sum(Visits)*100,2),0) as cv,
                IFNULL(round((sum(Revenue) - sum(Cost))/sum(Cost)*100,2),0) as roi ,
                round(sum(Revenue)/ 1000000 / sum(Visits),4) as epv,
                round(sum(Revenue)/ 1000000 / sum(Clicks),4) as epc,
                round(sum(Revenue)/ 1000000 / sum(Conversions),2) as ap `;
  //根据groupBy 拼接column 
  for (let index = 0; index < mapping[groupBy].attributes.length; index++) {
    if (_.isString(mapping[groupBy].attributes[index])) {
      column += `,${mapping[groupBy].attributes[index]} `
    } else if (_.isArray(mapping[groupBy].attributes[index])) {
      column += `,${mapping[groupBy].attributes[index][0]} as ${mapping[groupBy].attributes[index][1]} `
    }
  }

  if (groupBy.toLowerCase() == 'day') {
    //处理timezone 兼容列存储
    let tag = tz.slice(0, 1);
    let numberString = tz.slice(1);
    let slice = numberString.split(':');
    let intavlHour = `${tag}${parseInt(slice[0]) + (parseInt(slice[1]) / 60)}`
    column += `,DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} HOUR), "%Y-%m-%d") as 'id',
                DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} HOUR), "%Y-%m-%d") as  'day'`;
  } else if (groupBy.toLowerCase() == 'hour') {
    //处理timezone 兼容列存储
    let tag = tz.slice(0, 1);
    let numberString = tz.slice(1);
    let slice = numberString.split(':');
    let intavlHour = `${tag}${parseInt(slice[0]) + (parseInt(slice[1]) / 60)}`
    column += `,DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} HOUR), "%Y-%m-%d %H") as 'id',
                DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} HOUR), "%Y-%m-%d %H") as  'hour'`;
  }

  let tpl = `select ${column} from adstatis  where UserID =${userId} and ${where} group by ${mapping[groupBy].dbGroupBy} ${having} ${orders} `;

  let totalSQL = `select sum(visits) as visits,    
                sum(impressions) as impressions ,
                round(sum(revenue),2) as revenue,
                sum(clicks) as clicks,
                sum(conversions) as conversions ,
                round(sum(cost),2) as cost ,
                round(sum(profit),2) as profit , 
                round(sum(cost)/sum(visits),4) as cpv,
                round(sum(visits)/sum(impressions) *100,2) as ictr,
                round(sum(clicks)/sum(visits)*100,2) as ctr,
                round(sum(conversions)/sum(clicks)*100,4) as cr,
                round(sum(conversions)/sum(visits)*100,2) as cv,
                round(sum(profit)/sum(cost)*100,2) as roi,
                round(sum(revenue)/sum(visits),4) as epv,
                round(sum(revenue)/sum(clicks),4) as epc,
                round(sum(revenue)/sum(conversions),2) as ap from ((${tpl}) as T)`;

  if (values.dataType != "csv" && mustPagination && offset >= 0 && limit >= 0) {
    tpl += ` limit ${offset},${limit}`;
  }


  let connection = await common.getConnection('m2');

  let [rawRows, [totals]] = await Promise.all([
    common.query(tpl, [], connection),
    common.query(totalSQL, [], connection),
  ]);

  //释放链接
  if (connection) {
    connection.release();
  }



  //一般情况下只要填充一次  campaign 填充两次的原因是要关联traffic
  if (groupBy == "campaign") {
    rawRows = await fullFill({
      rawRows,
      groupBy: "traffic"
    });
  }

  rawRows = await fullFill({
    rawRows,
    groupBy
  });

  let totalRows = rawRows.length;
  return {
    rows: rawRows,
    totals,
    totalRows
  }
}

async function listPageReport(query) {
  let {
    userId,
    groupBy,
    filter,
    order,
    status,
    offset,
    limit
  } = query;
  let nr = await normalReport(query, false);
  let foreignConfig = extraConfig(groupBy);
  let _where = {
    userId,
  }
  if (groupBy == 'flow') {
    _where['type'] = {
      ne: 0
    }
  }
  if (filter) {
    _where.name = {
      $like: `%${filter}%`
    }
  }
  if (status == "0") {
    _where.deleted = 1;
  } else if (status == "1") {
    _where.deleted = 0;
  }

  let totalRows = await models[mapping[groupBy].table].count({
    where: _where
  });

  let listData = await models[mapping[groupBy].table].findAll({
    attributes: foreignConfig.attributes,
    where: _where
  })

  listData = listData.map((e) => {
    let obj = e.dataValues;
    nunberColumnForListPage.forEach(key => {
      obj[key] = 0;
    });
    return obj;
  })

  for (let i = 0; i < nr.rows.length; i++) {
    let rawForeignRow = nr.rows[i];
    for (let j = 0; j < listData.length; j++) {
      let rawRow = listData[j];
      if (rawForeignRow[foreignConfig.foreignKey] == rawRow.id) {
        let keys = Object.keys(rawForeignRow);
        keys.forEach(key => {
          if (key == 'id') return;
          rawRow[key] = rawForeignRow[key]
        })
        break;
      }

    }
  }
  if (order) {
    listData.sort(dynamicSort(order));
  }
  let totals = {
    impressions: listData.reduce((sum, row) => sum + row.impressions, 0),
    clicks: listData.reduce((sum, row) => sum + row.clicks, 0),
    visits: listData.reduce((sum, row) => sum + row.visits, 0),
    conversions: listData.reduce((sum, row) => sum + row.conversions, 0),
    revenue: listData.reduce((sum, row) => sum + row.revenue, 0),
    cost: listData.reduce((sum, row) => sum + row.cost, 0),
    profit: listData.reduce((sum, row) => sum + row.profit, 0),
    cpv: listData.reduce((sum, row) => sum + row.cost, 0) / listData.reduce((sum, row) => sum + row.visits, 0),
    ictr: listData.reduce((sum, row) => sum + row.visits, 0) / listData.reduce((sum, row) => sum + row.impression, 0),
    ctr: listData.reduce((sum, row) => sum + row.clicks, 0) / listData.reduce((sum, row) => sum + row.visits, 0),
    cr: listData.reduce((sum, row) => sum + row.conversions, 0) / listData.reduce((sum, row) => sum + row.clicks, 0),
    cv: listData.reduce((sum, row) => sum + row.conversions, 0) / listData.reduce((sum, row) => sum + row.visits, 0),
    epv: listData.reduce((sum, row) => sum + row.revenue, 0) / listData.reduce((sum, row) => sum + row.visits, 0),
    epc: listData.reduce((sum, row) => sum + row.revenue, 0) / listData.reduce((sum, row) => sum + row.clicks, 0),
    ap: listData.reduce((sum, row) => sum + row.revenue, 0) / listData.reduce((sum, row) => sum + row.conversions, 0),
  }
  totals.roi = totals.profit / totals.cost
  totals = formatTotals([totals])[0];
  if (offset >= 0 && limit >= 0) {
    listData = listData.slice(offset, offset + limit);
  }
  return {
    totals: totals,
    totalRows,
    rows: listData
  }
}

function dynamicSort(property) {
  var sortOrder = 1;
  if (property[0] == "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function(a, b) {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}


async function IPReport(req) {
  var schema = Joi.object().keys({
    campaign: Joi.number().required(),
    from: Joi.string().required(),
    to: Joi.string().required(),
    limit: Joi.number().required().min(0),
    page: Joi.number().required(),
    order: Joi.string().required(),
    groupBy: Joi.string().required(),
    tz: Joi.string().required(),
    userId: Joi.number().required(),
    status: Joi.number().optional(),
    columns: Joi.string().optional(),
    dataType: Joi.string().optional()
  });
  let connection;

  try {

    let value = await common.validate(req.query, schema);
    let {
      campaign,
      limit,
      page,
      from,
      to,
      tz,
      order,
      userId
    } = value;
    limit = parseInt(limit)
    page = parseInt(page)
    let offset = (page - 1) * limit;
    let dir = "asc";

    let sql = `select IP as ip,CampaignID as campaignId,Impressions as impressions,Visits as visits,Clicks as clicks,Conversions as conversions,
                  round(Cost/1000000,2) as cost,
                  round(Revenue/1000000,2) as revenue,
                  round(Revenue/1000000-Cost/1000000,2) as profit,
                  IFNULL(round(Cost/Visits/1000000,4),0.0000) as cpv,
                  IFNULL(round(Visits/Impressions,2),0.00) as ictr,
                  IFNULL(round(Clicks/Visits,2),0.00) as ctr,
                  IFNULL(round(Conversions/Clicks,2),0.00) as cr,
                  IFNULL(round(Conversions/Visits,2),0.00) as cv,
                  IFNULL(round((Revenue-Cost)/Cost,2),0.00) as roi,
                  IFNULL(round(Revenue/Visits/1000000,4),0.0000) as epv,
                  IFNULL(round(Revenue/Clicks/1000000,2),0.00) as epc,
                  IFNULL(round(Revenue/Conversions/1000000,2),0.00) as ap
                  from AdIPStatis where UserID=${userId} and CampaignID=${campaign} 
                  and Timestamp >=(UNIX_TIMESTAMP(CONVERT_TZ('${from}', '${tz}','+00:00'))*1000)  
                  and Timestamp<=(UNIX_TIMESTAMP(CONVERT_TZ('${to}', '${tz}','+00:00'))*1000)`;


    let countSql = `select COUNT(*) as total,IFNULL(sum(impressions),0) as impressions,IFNULL(sum(visits),0) as visits, 
                    IFNULL(sum(clicks),0) as clicks,IFNULL(sum(conversions),0) as conversions,
                    IFNULL(sum(cost),0) as cost,IFNULL(sum(revenue),0) as revenue,
                    IFNULL(sum(profit),0) as profit, 
                    IFNULL(round(sum(cost)/sum(visits),4),0.0000) as cpv,
                    IFNULL(round(sum(visits)/sum(impressions),2),0.00) as ictr,
                    IFNULL(round(sum(clicks)/sum(visits),2),0.00) as ctr,
                    IFNULL(round(sum(conversions)/sum(clicks),2),0.00) as cr,
                    IFNULL(round(sum(conversions)/sum(visits),2),0.00) as cv,
                    IFNULL(round((sum(revenue)-sum(cost))/sum(cost),2),0.00) as roi,
                    IFNULL(round(sum(revenue)/sum(visits),4),0.0000) as epv,
                    IFNULL(round(sum(revenue)/sum(clicks),2),0.00) as epc,
                    IFNULL(round(sum(revenue)/sum(conversions),2),0.00) as ap
                    from (( ${sql} ) as T)`;

    if (order.indexOf('-') >= 0) {
      dir = "desc";
      order = order.replace(new RegExp(/-/g), '');
    }

    if (req.query.dataType && req.query.dataType == "csv") {
      sql += " order by " + order + " " + dir;
    } else {
      sql += " order by " + order + " " + dir + "  limit " + offset + "," + limit;
    }

    connection = await common.getConnection();
    let result = await Promise.all([common.query(sql, [], connection), common.query(countSql, [], connection)]);
    let rows = result[0];
    let total = result[1][0];
    return {
      totalRows: total.total,
      totals: _.omit(total, 'total'),
      rows: rows
    }
  } catch (e) {
    throw e;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = router;