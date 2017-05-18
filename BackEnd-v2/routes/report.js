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
} from '../util/report';



async function saveReportLog(req) {
  let connection;
  try {
    connection = await common.getConnection();
    let sql = `insert into UserEventLog (userId,operatorId,operatorIP,entityType,entityTypeString,entityName,entityId,actionType,changedAt) values (?,?,?,?,?,?,?,?,?)`;
    await common.query(sql, [req.parent.id, req.user.id, req.clientIp, 0, req.query.groupBy, req.query.groupBy, '0', 'Report', moment().unix()], connection);
  } catch (e) {
    console.error('report log 上报error');
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * @api {get} /api/report  报表
 * @apiName  报表
 * @apiGroup report
 * @apiDescription  报表
 *
 */

//from   to tz  sort  direction  ]  groupBy  offset   limit  filter1  filter1Value  filter2 filter2Value
//dataType csv   columns=offerName,offerHash
router.get('/api/report', async function (req, res, next) {
  req.query.userId = req.parent.id;
  try {
    //上报用户行为
    saveReportLog(req);
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

//from to tz groupBy  columns
router.get('/api/export', async function (req, res, next) {
  req.query.userId = req.parent.id;
  try {
    let result;
    // let fieldsCol = [];
    // if (req.query.groupBy) {
    //   fieldsCol.push(req.query.groupBy);
    // }

    if (req.query.groupBy && req.query.groupBy == "ip") {
      result = await IPReport(req);
    } else {
      result = await getExportData(req.query);
    }
    let rawRows = result.rows;

    res.setHeader('Content-Disposition',
      `attachment;filename="NewBidder-${req.query.groupBy}-${moment().unix()}.csv"`
    );


    // let queryClo = req.query.columns ? req.query.columns.split(',') : [];
    // let fields = _.union(fieldsCol, queryClo);

    let csvData = json2csv({
      data: rawRows,
      fields: rawRows.length ? _.keys(rawRows[0]) : []
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

async function getExportData(values) {
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

  let where = `Timestamp>= (UNIX_TIMESTAMP(CONVERT_TZ('${from}','${tz}', '+00:00')) * 1000) 
               and Timestamp < (UNIX_TIMESTAMP(CONVERT_TZ('${to}','${tz}', '+00:00')) * 1000)`;



  let attrs = Object.keys(values);
  for (let index = 0; index < attrs.length; index++) {
    let attr = attrs[index];
    if (attr != 'day' && attr != 'hour' && attr != 'hourOfDay' && mapping[attr]) {
      where += ` and ${[mapping[attr].dbKey]} = '${values[attr]}'`;
    }
  }
  let groupByArray = groupBy.split(',');

  let column = [];
  //     //根据groupBy 拼接column
  for (let j = 0; j < groupByArray.length; j++) {
    let groupByItem = groupByArray[j];
    for (let index = 0; index < mapping[groupByItem].export.attributes.length; index++) {
      let attr = mapping[groupByItem].export.attributes[index];

      if (_.isString(attr)) {
        column.push(attr);
      } else if (_.isArray(attr)) {
        column.push(`${attr[0]} as ${attr[1]}`);
      }
    }
  }
  let orders = "";
  if (order) {
    if (order.slice(0, 1) == '-') {
      orders = ` order by ${order.slice(1)} DESC`;
    } else {
      orders = ` order by ${order} ASC`;
    }
  }

//处理timezone 兼容列存储
  let tag = tz.slice(0, 1);
  let numberString = tz.slice(1);
  let slice = numberString.split(':');
  let intavlHour = `${tag}${parseInt(slice[0]) * 60 + parseInt(slice[1])}`;

  if (_.indexOf(groupByArray, 'day') != -1) {
    column.push(`DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), "%Y-%m-%d") as  'day'`);
  }
  if (_.indexOf(groupByArray, 'hour') != -1) {
    column.push(`DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), "%Y-%m-%d %H") as  'hour'`);
  }
  if (_.indexOf(groupByArray, 'hourOfDay') != -1) {
    column.push(`DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), "%H") as  'hourOfDay'`);
  }

  let columnStr =
    `sum(Visits) as visits &&
                sum(Impressions) as impressions &&
                round(sum(Revenue/1000000),2) as revenue &&
                sum(Clicks) as clicks &&
                sum(Conversions) as conversions &&
                round(sum(Cost/1000000),2) as cost &&
                round(sum(Revenue / 1000000 - Cost / 1000000),2) as profit &&
                round(sum(Cost / 1000000) / sum(Visits),4) as cpv &&
                round(sum(Visits)/sum(Impressions)*100,2)  as  ictr &&
                IFNULL(round(sum(Clicks)/sum(Visits)*100,2),0) as ctr && 
                IFNULL(round(sum(Conversions)/sum(Clicks)*100,4),0) as  cr &&
                IFNULL(round(sum(Conversions)/sum(Visits)*100,2),0) as cv &&
                IFNULL(round((sum(Revenue) - sum(Cost))/sum(Cost)*100,2),0) as roi &&
                IFNULL(round(sum(Revenue)/ 1000000 / sum(Visits),4),0) as epv &&
                IFNULL(round(sum(Revenue)/ 1000000 / sum(Clicks),4),0) as epc &&
                IFNULL(round(sum(Revenue)/ 1000000 / sum(Conversions),2),0) as ap `;

  column = _.concat(column, columnStr.split('&&'));
  let GROUP = [];
  for (let index = 0; index < groupByArray.length; index++) {
    let groupItem = groupByArray[index];
    GROUP.push(mapping[groupItem].export.dbGroupBy)
  }
  let tpl = `select ${column.join(",")} from adstatis  where UserID =${userId} and ${where} group by ${GROUP.join(',')}  ${orders} `;


  let connection = await common.getConnection('m2');

  let rawRows = await common.query(tpl, [], connection);

  //释放链接
  if (connection) {
    connection.release();
  }

  return {
    rows: rawRows
  }
}
// async function getExportData(values) {
//   let connection;
//   try {
//     let {
//       userId,
//       from,
//       to,
//       tz,
//       groupBy,
//       filter,
//       order
//     } = values;
//     //====== start
//     let where =
//       `Timestamp>= (UNIX_TIMESTAMP(CONVERT_TZ('${from}','${tz}', '+00:00')) * 1000)
//                 and Timestamp < (UNIX_TIMESTAMP(CONVERT_TZ('${to}','${tz}', '+00:00')) * 1000)`;

//     if (_.has(values, 'day')) {
//       let start = moment(values.day.trim()).startOf('day').format(
//         "YYYY-MM-DDTHH:mm:ss");
//       let end = moment(values.day.trim()).add(1, 'd').startOf('day').format(
//         "YYYY-MM-DDTHH:mm:ss");
//       where =
//         ` Timestamp >= (UNIX_TIMESTAMP(CONVERT_TZ('${start}','${tz}', '+00:00')) * 1000) and Timestamp < (UNIX_TIMESTAMP(CONVERT_TZ( '${end}','${tz}', '+00:00')) * 1000)`;
//     }

//     if (_.has(values, 'hour')) {
//       let start = moment(values.hour.trim()).startOf('hour').format(
//         "YYYY-MM-DDTHH:mm:ss");
//       let end = moment(values.hour.trim()).add(1, 'hours').startOf('hour').format(
//         "YYYY-MM-DDTHH:mm:ss");
//       where =
//         ` Timestamp >= (UNIX_TIMESTAMP(CONVERT_TZ('${start}','${tz}', '+00:00')) * 1000) and Timestamp < (UNIX_TIMESTAMP(CONVERT_TZ( '${end}','${tz}', '+00:00')) * 1000)`;
//     }

//     let attrs = Object.keys(values);
//     for (let index = 0; index < attrs.length; index++) {
//       let attr = attrs[index];
//       if (attr != 'day' && attr != 'hour' && mapping[attr]) {
//         where += ` and ${[mapping[attr].dbKey]} = '${values[attr]}'`;
//       }
//     }


//     let orders = "";
//     if (order) {
//       if (order.slice(0, 1) == '-') {
//         orders = ` order by ${order.slice(1)} DESC`;
//       } else {
//         orders = ` order by ${order} ASC`;
//       }
//     }

//     let column = [];

//     let groupByArray = groupBy.split(',');

//     //根据groupBy 拼接column
//     for (let j = 0; j < groupByArray.length; j++) {
//       let groupByItem = groupByArray[j];
//       for (let index = 0; index < mapping[groupByItem].export.attributes.length; index++) {
//         let attr = mapping[groupByItem].export.attributes[index];

//         if (_.isString(attr)) {
//           column.push(attr);
//         } else if (_.isArray(attr)) {
//           column.push(`${attr[0]} as ${attr[1]}`);
//         }
//       }
//     }

//     let clostring =
//       `sum(Visits) as visits,
//                 sum(Impressions) as impressions ,
//                 round(sum(Revenue/1000000),2) as revenue,
//                 sum(Clicks) as clicks,
//                 sum(Conversions) as conversions ,
//                 round(sum(Cost/1000000),2) as cost ,
//                 round(sum(Revenue / 1000000 - Cost / 1000000),2) as profit ,
//                 round(sum(Cost / 1000000) / sum(Visits),4) as cpv,
//                 round(sum(Visits)/sum(Impressions)*100,2)  as  ictr,
//                 IFNULL(round(sum(Clicks)/sum(Visits)*100,2),0) as ctr,
//                 IFNULL(round(sum(Conversions)/sum(Clicks)*100,4),0) as  cr,
//                 IFNULL(round(sum(Conversions)/sum(Visits)*100,2),0) as cv,
//                 IFNULL(round((sum(Revenue) - sum(Cost))/sum(Cost)*100,2),0) as roi ,
//                 IFNULL(round(sum(Revenue)/ 1000000 / sum(Visits),4),0) as epv,
//                 IFNULL(round(sum(Revenue)/ 1000000 / sum(Clicks),4),0) as epc,
//                 IFNULL(round(sum(Revenue)/ 1000000 / sum(Conversions),2),0) as ap `;

//     column = _.concat(column, clostring.split('&&'));
//     if (_.indexOf(groupByArray, 'day') != -1) {
//       //处理timezone 兼容列存储
//       let tag = tz.slice(0, 1);
//       let numberString = tz.slice(1);
//       let slice = numberString.split(':');
//       let intavlHour =
//         `${tag}${parseInt(slice[0]) * 60 + parseInt(slice[1])}`;
//       column.push(
//         `DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), "%Y-%m-%d") as  'day'`
//       );
//     }
//     if (_.indexOf(groupByArray, 'hour') != -1) {
//       //处理timezone 兼容列存储
//       let tag = tz.slice(0, 1);
//       let numberString = tz.slice(1);
//       let slice = numberString.split(':');
//       let intavlHour =
//         `${tag}${parseInt(slice[0]) * 60 + parseInt(slice[1])}`
//       column.push(
//         `DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), "%Y-%m-%d %H") as  'hour'`
//       );
//     }

//     let GROUP = [];
//     for (let index = 0; index < groupByArray.length; index++) {
//       let groupItem = groupByArray[index];
//       GROUP.push(mapping[groupItem].export.dbGroupBy)
//     }
//     let tpl =
//       `select ${column.join(",")} from adstatis  where UserID =${userId} and ${where} group by ${GROUP.join(',')}  ${orders} `;

//     connection = await common.getConnection('m2');
//     let rawRows = await common.query(tpl, [], connection);
//     return {
//       rows: rawRows
//     }
//   } catch (e) {
//     throw e;
//   } finally {
//     if (connection) {
//       connection.release()
//     }
//   }

// }


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
  if (isListPageRequest(value)) {
    return listPageReport(value)
  } else {
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

  let where = `Timestamp>= (UNIX_TIMESTAMP(CONVERT_TZ('${from}','${tz}', '+00:00')) * 1000) 
               and Timestamp < (UNIX_TIMESTAMP(CONVERT_TZ('${to}','${tz}', '+00:00')) * 1000)`;

  let attrs = Object.keys(values);
  for (let index = 0; index < attrs.length; index++) {
    let attr = attrs[index];
    if (attr != 'day' && attr != 'hour' && attr != 'hourOfDay' &&mapping[attr]) {
      where += ` and ${[mapping[attr].dbKey]} = '${values[attr]}'`;
    }
  }

  //TODO 不应该数据表模糊查询
  if (filter) {
    //单独处理group by day
    if (groupBy == 'day' || groupBy == 'hour') {
      having = `having ${mapping[groupBy].dbFilter} like '%${filter}%'`;
    } else if (!mapping[groupBy].listPage) {
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

  let column =
    `sum(Visits) as visits,
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
                IFNULL(round(sum(Revenue)/ 1000000 / sum(Visits),4),0) as epv,
                IFNULL(round(sum(Revenue)/ 1000000 / sum(Clicks),4),0) as epc,
                IFNULL(round(sum(Revenue)/ 1000000 / sum(Conversions),2),0) as ap `;

  for (let index = 0; index < mapping[groupBy].attributes.length; index++) {
    if (_.isString(mapping[groupBy].attributes[index])) {
      column += `,${mapping[groupBy].attributes[index]} `
    } else if (_.isArray(mapping[groupBy].attributes[index])) {
      column +=
        `,${mapping[groupBy].attributes[index][0]} as ${mapping[groupBy].attributes[index][1]} `
    }
  }

  //处理timezone 兼容列存储
  let tag = tz.slice(0, 1);
  let numberString = tz.slice(1);
  let slice = numberString.split(':');
  let intavlHour = `${tag}${parseInt(slice[0]) * 60 + parseInt(slice[1])}`;

  if (groupBy.toLowerCase() == 'day') {
    column += `,DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), "%Y-%m-%d") as 'id',
                DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), "%Y-%m-%d") as  'day'`;
  } else if (groupBy.toLowerCase() == 'hour') {
    column += `,DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), "%Y-%m-%d %H") as 'id',
                DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), "%Y-%m-%d %H") as  'hour'`;
  } else if (groupBy.toLowerCase() == 'hourofday') {
    column += `,DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), "%H") as 'id',
                DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), "%H") as  'hourOfDay'`;
  }
  let tplGroupBy = `group by ${mapping[groupBy].dbGroupBy}`;

  //drilldown day->hour  or  hour->day 因为 day 
  if (_.has(values, 'day')) {
    column += `,DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), "%Y-%m-%d") as  'day'`;
    tplGroupBy += `,day`;
    if (having != "") {
      having += ` and day='${values.day}'`;
    } else {
      having = ` having day='${values.day}' `;
    }
  } 
   if (_.has(values, 'hour')) {
    column += `,DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), "%Y-%m-%d %H") as  'hour'`;
    tplGroupBy += `,hour`;
    if (having != "") {
      having += ` and hour='${values.hour}'`;
    } else {
      having = `having hour='${values.hour}' `;
    }
  } 
   if (_.has(values, 'hourOfDay')) {
    column += `,DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), "%H") as  'hourOfDay'`;
    tplGroupBy += `,hourOfDay`;
    if (having != "") {
      having += ` and hourOfDay='${values.hourOfDay}'`;
    } else {
      having = `having hourOfDay='${values.hourOfDay}' `;
    }
  }

  let tpl = `select ${column} from adstatis  where UserID =${userId} and ${where} ${tplGroupBy} ${having} ${orders} `;
  let totalSQL = `select COUNT(*) as total,sum(visits) as visits,    
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

  if (mustPagination && offset >= 0 && limit >= 0) {
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


  let totalRows = totals.total;

  //填充hourofday的数据
  if (groupBy.toLowerCase() == 'hourofday' && mapping[groupBy].listPage) {
    rawRows = fullfillHourofDay(rawRows);
    rawRows.sort(dynamicSort(order))
  }
  return {
    rows: rawRows,
    totals,
    totalRows
  }
}



function fullfillHourofDay(rawRows) {
  //用于填充 hourofday 的数据
  let DATAOFHOUROFDAY = [
    { id: '00', hourOfDay: '00', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '01', hourOfDay: '01', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '02', hourOfDay: '02', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '03', hourOfDay: '03', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '04', hourOfDay: '04', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '05', hourOfDay: '05', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '06', hourOfDay: '06', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '07', hourOfDay: '07', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '08', hourOfDay: '08', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '09', hourOfDay: '09', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '10', hourOfDay: '10', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '11', hourOfDay: '11', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '12', hourOfDay: '12', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '13', hourOfDay: '13', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '14', hourOfDay: '14', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '15', hourOfDay: '15', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '16', hourOfDay: '16', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '17', hourOfDay: '17', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '18', hourOfDay: '18', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '19', hourOfDay: '19', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '20', hourOfDay: '20', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '21', hourOfDay: '21', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '22', hourOfDay: '22', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 },
    { id: '23', hourOfDay: '23', visits: 0, impressions: 0, revenue: 0, clicks: 0, conversions: 0, cost: 0, profit: 0, cpv: 0, ictr: 0, ctr: 0, cr: 0, cv: 0, roi: 0, epv: 0, epc: 0, ap: 0 }
  ];

  for (let i = 0; i < DATAOFHOUROFDAY.length; i++) {
    for (let j = 0; j < rawRows.length; j++) {
      if (DATAOFHOUROFDAY[i].id == rawRows[j].id) {
        DATAOFHOUROFDAY[i] = rawRows[j];
      }
    }
  }
  return DATAOFHOUROFDAY;
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
    cpv: listData.reduce((sum, row) => sum + row.cost, 0) / listData.reduce((
      sum, row) => sum + row.visits, 0),
    ictr: listData.reduce((sum, row) => sum + row.visits, 0) / listData.reduce(
      (sum, row) => sum + row.impression, 0),
    ctr: listData.reduce((sum, row) => sum + row.clicks, 0) / listData.reduce(
      (sum, row) => sum + row.visits, 0),
    cr: listData.reduce((sum, row) => sum + row.conversions, 0) / listData.reduce(
      (sum, row) => sum + row.clicks, 0),
    cv: listData.reduce((sum, row) => sum + row.conversions, 0) / listData.reduce(
      (sum, row) => sum + row.visits, 0),
    epv: listData.reduce((sum, row) => sum + row.revenue, 0) / listData.reduce(
      (sum, row) => sum + row.visits, 0),
    epc: listData.reduce((sum, row) => sum + row.revenue, 0) / listData.reduce(
      (sum, row) => sum + row.clicks, 0),
    ap: listData.reduce((sum, row) => sum + row.revenue, 0) / listData.reduce(
      (sum, row) => sum + row.conversions, 0),
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
  return function (a, b) {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ?
      1 : 0;
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


    let sql = `select CountryName as country,IP as ip,CampaignID as campaignId,sum(Impressions) as impressions,sum(Visits) as visits,sum(Clicks) as clicks,sum(Conversions) as conversions,
                  round(sum(Cost/1000000),2) as cost,
                  round(sum(Revenue/1000000),2) as revenue,
                  round(sum(Revenue/1000000)-sum(Cost/1000000),2) as profit,
                  IFNULL(round(sum(Cost/1000000)/sum(Visits),4),0.0000) as cpv,
                  IFNULL(round(sum(Visits)/sum(Impressions),2),0.00) as ictr,
                  IFNULL(round(sum(Clicks)/sum(Visits),2),0.00) as ctr,
                  IFNULL(round(sum(Conversions)/sum(Clicks),2),0.00) as cr,
                  IFNULL(round(sum(Conversions)/sum(Visits),2),0.00) as cv,
                  IFNULL(round((sum(Revenue)-sum(Cost))/sum(Cost),2),0.00) as roi,
                  IFNULL(round(sum(Revenue/1000000)/sum(Visits),4),0.0000) as epv,
                  IFNULL(round(sum(Revenue/1000000)/sum(Clicks),2),0.00) as epc,
                  IFNULL(round(sum(Revenue/1000000)/sum(Conversions),2),0.00) as ap
                  from AdIPStatis where UserID=${userId} and CampaignID=${campaign} 
                  and Timestamp >=(UNIX_TIMESTAMP(CONVERT_TZ('${from}', '${tz}','+00:00'))*1000)  
                  and Timestamp<=(UNIX_TIMESTAMP(CONVERT_TZ('${to}', '${tz}','+00:00'))*1000) group by IP `;



    let countSql =
      `select COUNT(*) as total,IFNULL(sum(impressions),0) as impressions,IFNULL(sum(visits),0) as visits,
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
      sql += " order by " + order + " " + dir + "  limit " + offset + "," +
        limit;
    }

    connection = await common.getConnection();
    let result = await Promise.all([common.query(sql, [], connection), common.query(
      countSql, [], connection)]);
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
