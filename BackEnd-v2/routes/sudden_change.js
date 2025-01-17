var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var setting = require('../config/setting');

/**
 * @api {get} /api/automated/rules/:id  获取用户 sudden change rule detail
 * @apiName   获取用户 sudden change rule detail
 * @apiGroup User
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{}
 *     }
 *
 */
router.get('/api/automated/rules/:id', async function(req, res, next) {
  let connection;
  try {
    var schema = Joi.object().keys({
      userId: Joi.number().required(),
      id: Joi.number().required()
    });
    req.query.userId = req.parent.id;
    req.query.id = req.params.id;
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    let sql =
      `select id,name,dimension,timeSpan,\`condition\`,\`schedule\`,scheduleString,status,emails,oneTime from SuddenChangeRule where id= ? and userId = ?`;
    let camsql =
      `select c.campaignId as id,t.name as name from SCRule2Campaign c inner join TrackingCampaign t on t.id=c.campaignId where t.userId=? and c.ruleId=?`;
    let [
      [Result], campaigns
    ] = await Promise.all([common.query(sql, [value.id, value.userId],
        connection),
      common.query(camsql, [value.userId, value.id], connection)
    ]);
    if (Result) {
      let campaignSlice = [];
      for (let index = 0; index < campaigns.length; index++) {
        campaignSlice.push(campaigns[index].id);
      }
      Result.campaigns = campaignSlice.join(',');
    }
    res.json({
      status: 1,
      message: "success",
      data: Result ? Result : {}
    });

  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


/**
 * @api {get} /api/automated/rules  获取用户sudden change Rules
 * @apiName  获取用户sudden change Rules
 * @apiGroup sudden_change
 * @apiParam {Number} page
 * @apiParam {Number} limit
 * @apiParam {Number} status: 0: inactive, 1: active, 2: all
 * @apiParam {String} [filter]
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{}
 *     }
 *
 */

router.get('/api/automated/rules', async function(req, res, next) {

  let connection;
  try {
    let schema = Joi.object().keys({
      userId: Joi.number().required(),
      page: Joi.number().required(),
      limit: Joi.number().required(),
      filter: Joi.string().optional(),
      status: Joi.number().required()
    });
    req.query.userId = req.parent.id;
    let value = await common.validate(req.query, schema);
    let {
      limit,
      page
    } = value;

    // limit
    limit = parseInt(limit);
    if (!limit || limit < 0)
      limit = 50;
    value.limit = limit;
    // offset
    page = parseInt(page);
    let offset = (page - 1) * limit;
    if (!offset)
      offset = 0;
    value.offset = offset;
    connection = await common.getConnection();
    let filter = "";
    if (value.filter != undefined && value.filter) {
      filter = ` and name like '%${value.filter}%' `;
    }
    let statusFilter = "";
    switch (value.status) {
      case 2:
        statusFilter = "";
        break;
      default:
        statusFilter = ` and status=${value.status} `;
    }
    let sql =
      `select id,name,dimension,timeSpan,status from SuddenChangeRule where userId =? and deleted=0 ${filter} ${statusFilter} order by id DESC `;
    let totalsql = `select count(*) as total from  ((${sql}) as T)`;
    sql += ` limit ?,?`
    let params = [value.userId, value.offset, value.limit];
    let [Result, [{
      total: Total
    }]] = await Promise.all(
      [common.query(sql, params, connection),
        common.query(totalsql, [value.userId], connection)
      ]);

    return res.json({
      status: 1,
      message: "success",
      data: {
        rules: Result,
        totalRows: Total
      }
    });

  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @api {post} /api/automated/rules  sudden change编辑Rule
 * @apiName sudden change编辑Rule
 * @apiGroup  sudden_change
 *
 * @apiParam {String} [name]
 * @apiParam {String} [campaigns]
 * @apiParam {String} [dimension]
 * @apiParam {String} [timeSpan]
 * @apiParam {String} [condition]
 * @apiParam {String} [schedule]
 * @apiParam {String} [scheduleString]
 * @apiParam {String} [emails]
 * @apiParam {Number} [status]
 * @apiParam {String} [oneTime]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success'
 *   }
 *
 */
router.post('/api/automated/rules/:id', async function(req, res, next) {
  var schema = Joi.object().keys({
    id: Joi.number().required(),
    userId: Joi.number().required(),
    name: Joi.string().optional(),
    campaigns: Joi.string().optional(),
    dimension: Joi.string().optional(),
    timeSpan: Joi.string().optional(),
    condition: Joi.string().optional(),
    schedule: Joi.string().optional(),
    scheduleString: Joi.string().optional(),
    emails: Joi.string().optional(),
    status: Joi.number().optional(),
    oneTime: Joi.string().optional().allow("")
  });

  req.body.userId = req.parent.id;
  req.body.id = req.params.id;
  let connection;
  try {
    let value = await common.validate(req.body, schema);
    connection = await common.getConnection();
    let sql = `update SuddenChangeRule set userId = ? `;
    let params = [value.userId]
    if (value.name != undefined) {
      sql += `,name= ?`;
      params.push(value.name)
    }
    if (value.dimension != undefined) {
      sql += `,dimension= ?`;
      params.push(value.dimension)
    }
    if (value.timeSpan != undefined) {
      sql += `,timeSpan= ?`;
      params.push(value.timeSpan)
    }
    if (value.condition != undefined) {
      sql += `,\`condition\`= ?`;
      params.push(value.condition)
    }
    if (value.schedule != undefined) {
      sql += `,\`schedule\`= ?`;
      params.push(value.schedule)
    }
    if (value.scheduleString != undefined) {
      sql += `,scheduleString= ?`;
      params.push(value.scheduleString)
    }
    if (value.emails != undefined) {
      sql += `,emails= ?`;
      params.push(value.emails)
    }
    if (value.status != undefined) {
      sql += `,status= ?`;
      params.push(value.status)
    }
    if (value.oneTime != undefined) {
      sql += `,oneTime= ?`;
      params.push(value.oneTime)
    }
    sql += ` where id= ? and userId= ?`;
    params.push(value.id);
    params.push(value.userId);
    await common.query(sql, params, connection);
    if (value.campaigns != undefined) {
      await common.query('delete from SCRule2Campaign where ruleId = ?', [
        value.id
      ], connection);
      let campaignArray = value.campaigns.split(',');
      for (let index = 0; index < campaignArray.length; index++) {
        await common.query(
          'insert into SCRule2Campaign(ruleId,campaignId) values (?,?)', [
            value.id, campaignArray[index]
          ], connection);
      }
    }
    delete value.userId;
    res.json({
      status: 1,
      message: 'success',
      data: value
    });
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


/**
 * @api {post} /api/automated/rules  sudden change新增Rule
 * @apiName sudden change新增Rule
 * @apiGroup  sudden_change
 *
 * @apiParam {String} name
 * @apiParam {String} campaigns
 * @apiParam {String} dimension
 * @apiParam {String} timeSpan
 * @apiParam {String} condition
 * @apiParam {String} schedule
 * @apiParam {String} scheduleString
 * @apiParam {String} emails
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success'
 *   }
 *
 */
router.post('/api/automated/rules', async function(req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required(),
    name: Joi.string().required(),
    campaigns: Joi.string().required(),
    dimension: Joi.string().required(),
    timeSpan: Joi.string().required(),
    condition: Joi.string().required(),
    schedule: Joi.string().required(),
    scheduleString: Joi.string().required(),
    emails: Joi.string().required(),
    oneTime: Joi.string().optional(),
    status: Joi.number().required()
  });
  req.body.userId = req.parent.id;
  let connection;
  try {
    let value = await common.validate(req.body, schema);
    connection = await common.getConnection();
    let v =
      `userId,name,dimension,timeSpan,\`condition\`,\`schedule\`,scheduleString,emails,status`;
    let p = `?,?,?,?,?,?,?,?,?`;
    let params = [value.userId, value.name, value.dimension, value.timeSpan,
      value.condition, value.schedule, value.scheduleString, value.emails,value.status
    ];
    if (value.oneTime) {
      v += `,oneTime`;
      p += `,?`;
      params.push(value.oneTime);
    }
    let sql = `insert into SuddenChangeRule (${v}) values(${p})`;

    let {
      insertId: InsertId
    } = await common.query(sql, params, connection);
    let campaignArray = value.campaigns.split(',');
    for (let index = 0; index < campaignArray.length; index++) {
      await common.query(
        'insert into SCRule2Campaign(ruleId,campaignId) values (?,?)', [
          InsertId, campaignArray[index]
        ], connection);
    }
    value.id = InsertId;
    delete value.userId;
    res.json({
      status: 1,
      message: 'success',
      data: value
    });
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


/**
 * @api {delete} /api/automated/rules/:id 删除rule
 * @apiName  删除rule
 * @apiGroup sudden_change
 *
 */
router.delete('/api/automated/rules/:id', async function(req, res, next) {
  var schema = Joi.object().keys({
    id: Joi.number().required(),
    userId: Joi.number().required()
  });
  req.query.userId = req.parent.id;
  req.query.id = req.params.id;
  let connection;
  try {
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    let sql =
      `update SuddenChangeRule set deleted = 1 where userId = ? and id =?`;
    await common.query(sql, [value.userId, value.id], connection);
    res.json({
      status: 1,
      message: 'success'
    });
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @api {get}/api/automated/logs 获取rule的log记录
 * @apiName获取rule的log记录
 *
 * @apiGroup sudden_change
 *
 *@apiParam {Number} page
 *@apiParam {Number} limit
 *@apiParam {String} filter
 *@apiParam {String} [from]
 *@apiParam {String} [to]
 *
 */

router.get('/api/automated/logs', async function(req, res, next) {
  let schema = Joi.object().keys({
    userId: Joi.number().required(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
    filter: Joi.string().optional(),
    from: Joi.string().required(),
    to: Joi.string().required(),
    tz:Joi.string().required()
  });
  req.query.userId = req.parent.id;
  let connection;
  try {
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    let {
      limit,
      page
    } = value;
    // limit
    limit = parseInt(limit);
    if (!limit || limit < 0)
      limit = 50;
    value.limit = limit;
    // offset
    page = parseInt(page);
    let offset = (page - 1) * limit;
    if (!offset)
      offset = 0;
    value.offset = offset;

    let filter = "";
    if (value.filter != undefined && value.filter) {
      filter = ` and rule.name like '%${value.filter}%' `;
    }

    let timeFilter = "";
    if (value.from) {
      timeFilter +=
        ` and log.timeStamp >= (UNIX_TIMESTAMP(CONVERT_TZ('${value.from}', '${value.tz}','+00:00')))  `;
    }
    if (value.to) {
      timeFilter +=
        ` and log.timeStamp <= (UNIX_TIMESTAMP(CONVERT_TZ('${value.to}', '${value.tz}','+00:00')))  `;
    }
  
    let sql =
      `select log.id as id ,DATE_FORMAT(convert_tz(FROM_UNIXTIME(log.timeStamp, "%Y-%m-%d %H:%i:%s"),'+00:00','${value.tz}') ,'%Y-%m-%d %H:%i:%s') as time,rule.name as name,log.dimension as dimension
                  from SuddenChangeLog log inner join SuddenChangeRule rule on log.ruleId = rule.id  where rule.userId =? ${filter} ${timeFilter} order by log.timeStamp DESC`;


    let totalsql = `select count(*) as total from  ((${sql}) as T)`;
    sql += ` limit ?,?`
    let params = [value.userId, value.offset, value.limit];
    let [Result, [{
      total: Total
    }]] = await Promise.all(
      [common.query(sql, params, connection),
        common.query(totalsql, [value.userId], connection)
      ]);

    return res.json({
      status: 1,
      message: 'success',
      data: {
        logs: Result,
        totalRows: Total
      }
    });
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});



/**
 * @apiName 获取rule的log的详情
 *
 */
router.get('/api/automated/logs/detail/:id', async function(req, res, next) {
  let schema = Joi.object().keys({
    userId: Joi.number().required(),
    id: Joi.number().required()
  });
  req.query.userId = req.parent.id;
  req.query.id = req.params.id;
  let connection;
  try {
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();

    let sql =
      `select detail.id,detail.data,detail.dimensionKey,detail.dimensionValue,cam.name as campaign from SuddenChangeLogDetail detail inner join TrackingCampaign cam on cam.id = detail.campaignID
                   where detail.logId = ?`;
    let Result = await common.query(sql, [value.id], connection);
    return res.json({
      status: 1,
      message: 'success',
      data: {
        logs: Result
      }
    });
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});



module.exports = router;
