var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var setting = require('../config/setting');



//codition model
const conditionResult = [{
  "id": "model",
  "display": "Brand and model",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "l2select",
    "name": "value",
    "options": []
  }]
}, {
  "id": "browser",
  "display": "Browser and version",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "l2select",
    "name": "value",
    "options": []
  }]
}, {
  "id": "connection",
  "display": "Connection Type",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "chips",
    "name": "value",
    "options": []
  }]
}, {
  "id": "country",
  "display": "Country",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "chips",
    "name": "value",
    "options": []
  }]
}, {
  "id": "region",
  "display": "State / Region",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "async-chips",
    "name": "value",
    "url": "/api/regions"
  }]
}, {
  "id": "city",
  "display": "City",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "async-chips",
    "name": "value",
    "url": "/api/cities"
  }]

}, {
  "id": "weekday",
  "display": "Day of week",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "checkbox",
    "name": "weekday",
    "options": [{
      "value": "0",
      "display": "Monday"
    }, {
      "value": "1",
      "display": "Tuesday"
    }, {
      "value": "2",
      "display": "Wednesday"
    }, {
      "value": "3",
      "display": "Thursday"
    }, {
      "value": "4",
      "display": "Friday"
    }, {
      "value": "5",
      "display": "Saturday"
    }, {
      "value": "6",
      "display": "Sunday"
    }]
  }, {
    "type": "select",
    "label": "Time zone",
    "name": "tz",
    "options": [{
      "value": "+05:45",
      "display": "(UTC+05:45) Kathmandu"
    }, {
      "value": "-03:30",
      "display": "(UTC-03:30) Newfoundland"
    }, {
      "value": "+8:00",
      "display": "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi"
    }, {
      "value": "-7:00",
      "display": "(UTC-07:00) Mountain Time (US & Canada)"
    }, {
      "value": "+7:00",
      "display": "(UTC+07:00) Bangkok, Hanoi, Jakarta"
    }]
  }]
}, {
  "id": "device",
  "display": "Device type",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "chips",
    "name": "value",
    "options": []
  }]
}, {
  "id": "iprange",
  "display": "IP and IP ranges",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "textarea",
    "name": "value",
    "desc": "Enter one IP address or subnet per line in the following format: 20.30.40.50 or 20.30.40.50/24"
  }]
}, {
  "id": "isp",
  "display": "ISP",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "async-chips",
    "name": "value",
    "url": "/api/isps"
  }]
}, {
  "id": "language",
  "display": "Language",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "chips",
    "name": "value",
    "options": []
  }]
}, {
  "id": "carrier",
  "display": "Mobile Carrier",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "async-chips",
    "name": "value",
    "url": "/api/carriers"
  }]
}, {
  "id": "os",
  "display": "Operating system and version",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "l2select",
    "name": "value",
    "options": []
  }]
}, {
  "id": "referrer",
  "display": "Referrer",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "textarea",
    "name": "value",
    "desc": ""
  }]
}, {
  "id": "time",
  "display": "Time of day",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "inputgroup",
    "inputs": [{
      "label": "Between",
      "name": "starttime",
      "placeholder": "00:00"
    }, {
      "label": "and",
      "name": "endtime",
      "placeholder": "00:00"
    }]
  }, {
    "type": "select",
    "label": "Time zone",
    "name": "tz",
    "options": [{
      "value": "utc",
      "display": "UTC"
    }, {
      "value": "-8",
      "display": "-8 PDT"
    }, {
      "value": "+8",
      "display": "+8 Shanghai"
    }, {
      "value": "+7",
      "display": "+7 Soul"
    }, {
      "value": "+9",
      "display": "+7 Tokyo"
    }]
  }]
}, {
  "id": "useragent",
  "display": "User Agent",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "textarea",
    "name": "value",
    "desc": ""
  }]
}, {
  "id": "var1",
  "display": "Custom variable 1",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "input",
    "name": "value",
    "placeholder": ""
  }]
}, {
  "id": "var2",
  "display": "Custom variable 2",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "input",
    "name": "value",
    "placeholder": ""
  }]
}, {
  "id": "var3",
  "display": "Custom variable 3",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "input",
    "name": "value",
    "placeholder": ""
  }]
}, {
  "id": "var4",
  "display": "Custom variable 4",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "input",
    "name": "value",
    "placeholder": ""
  }]
}, {
  "id": "var5",
  "display": "Custom variable 5",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "input",
    "name": "value",
    "placeholder": ""
  }]
}, {
  "id": "var6",
  "display": "Custom variable 6",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "input",
    "name": "value",
    "placeholder": ""
  }]
}, {
  "id": "var7",
  "display": "Custom variable 7",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "input",
    "name": "value",
    "placeholder": ""
  }]
}, {
  "id": "var8",
  "display": "Custom variable 8",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "input",
    "name": "value",
    "placeholder": ""
  }]
}, {
  "id": "var9",
  "display": "Custom variable 9",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "input",
    "name": "value",
    "placeholder": ""
  }]
}, {
  "id": "var10",
  "display": "Custom variable 10",
  "operands": [{
    value: "is",
    display: "Is"
  }, {
    value: "isnt",
    display: "Isnt"
  }],
  "fields": [{
    "type": "input",
    "name": "value",
    "placeholder": ""
  }]
}];

/**
 * @api {get} /api/flows  获取用户所有flows
 * @apiName  get  user  flows
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
router.get('/api/flows', function (req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required()
  });
  req.query.userId = req.parent.id;
  Joi.validate(req.query, schema, function (err, value) {
    if (err) {
      return next(err);
    }
    pool['m1'].getConnection(function (err, connection) {
      if (err) {
        err.status = 303
        return next(err);
      }
      connection.query(
        "select  `id`,`name` from Flow where `userId` = ? and `deleted` =0 and `type`=1", [
          value.userId
        ],
        function (err, result) {
          connection.release();
          if (err) {
            return next(err);
          }
          res.json({
            status: 1,
            message: "success",
            data: {
              flows: result
            }
          });

        });
    });
  });
});


/**
 * @api {get} /api/flows/:id/campaigns 获取flow相关的所有campaign
 * @apiName 获取flow相关的所有campaign
 * @apiGroup flow
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{
 *        campaigns:[{id:,name:""}]
 *     }
 *
 *   }
 */

router.get('/api/flows/:id/campaigns', async function (req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required(),
    id: Joi.number().required()
  });
  let connection;
  try {
    req.query.userId = req.parent.id;
    req.query.id = req.params.id;
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    let result = await query("select `id`,`name`,`hash` from TrackingCampaign where `targetType`= 1 and `targetFlowId` = ? and `userId`= ?", [value.id, value.userId], connection);
    res.json({
      status: 1,
      message: 'success',
      data: {
        campaigns: result.length ? result : []
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
 * @api {get} /api/flows/:id 获取flow detail
 * @apiName 获取flow detail
 * @apiGroup flow
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{
 *        campaigns:[{id:,name:""}]
 *     }
 *
 *   }
 */

router.get('/api/flows/:id', async function (req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required(),
    id: Joi.number().required()
  });
  let connection;
  try {
    req.query.userId = req.parent.id;
    req.query.id = req.params.id;
    let Result = {};
    Result.rules = [];
    let value = await common.validate(req.query, schema);

    let flowSql = "select `id`,`name`,`hash`,`country`,`type`,`redirectMode` from Flow where  `id` = ? and `userId`= ?";
    let ruleSql = "select  f.`id` as parentId, r.`id`,case r.`type` when 0 then 'Default Paths' else r.`name` end as name, r.`object` as conditions ,case r.`status` when 1 then \"true\" else \"false\" end as enabled,r.`type`,case r.`type` when 0 then 'true' else 'false' end as isDefault " +
      "from Flow f " +
      "inner join `Rule2Flow` f2 on f2.`flowId` = f.`id` " +
      "inner join `Rule` r on r.`id` = f2.`ruleId` " +
      "where f2.`deleted`= 0 and r.`deleted` = 0  and f.`id` = ? and f.`userId`= ? order by f2.`order` ASC";

    let pathsql = "select  r.`id` as parentId, p.`id`,p.`name`, case p.`directLink` when 1 then \"true\" else \"false\" end as directLinking ,p.`redirectMode`," +
      "case p.`status` when 1 then \"true\" else \"false\" end as enabled,r2.`weight`  " +
      "from Flow f " +
      "inner join `Rule2Flow` f2 on f2.`flowId` = f.`id` " +
      "inner join `Rule` r on r.`id` = f2.`ruleId`  " +
      "inner join `Path2Rule` r2 on r2.`ruleId`= r.`id` " +
      "inner join `Path` p on p.`id` = r2.`pathId` " +
      "where f2.`deleted`= 0 and r.`deleted` = 0  " +
      "and r2.`deleted`= 0 and p.`deleted` = 0  " +
      "and f.`id` = ? and f.`userId`= ? order by r2.`order` ASC ";

    let landerSql = "select  p.`id` as parentId, l.`id`,l.`name`,p2.`weight` " +
      "from Flow f " +
      "inner join `Rule2Flow` f2 on f2.`flowId` = f.`id` " +
      "inner join `Rule` r on r.`id` = f2.`ruleId`  " +
      "inner join `Path2Rule` r2 on r2.`ruleId`= r.`id` " +
      "inner join `Path` p on p.`id` = r2.`pathId` " +
      "inner join `Lander2Path` p2 on p2.`pathId` = p.`id`  " +
      "inner join `Lander` l on l.`id`= p2.`landerId` " +
      "where    f2.`deleted`= 0 and r.`deleted` = 0  " +
      "and r2.`deleted`= 0 and p.`deleted` = 0   " +
      "and p2.`deleted` = 0 and l.`deleted` = 0  " +
      "and f.`id` =?  and f.`userId`= ? order by p2.`order` ASC";

    let offerSql = "select  p.`id` as parentId, l.`id`,l.`name`,p2.`weight` " +
      "from Flow f " +
      "inner join `Rule2Flow` f2 on f2.`flowId` = f.`id` " +
      "inner join `Rule` r on r.`id` = f2.`ruleId`  " +
      "inner join `Path2Rule` r2 on r2.`ruleId`= r.`id` " +
      "inner join `Path` p on p.`id` = r2.`pathId` " +
      "inner join `Offer2Path` p2 on p2.`pathId` = p.`id`  " +
      "inner join `Offer` l on l.`id`= p2.`offerId` " +
      "where  f2.`deleted`= 0 and r.`deleted` = 0  " +
      "and r2.`deleted`= 0 and p.`deleted` = 0   " +
      "and p2.`deleted` = 0 and l.`deleted` = 0  " +
      "and f.`id` = ? and f.`userId`= ? order by p2.`order` ASC";


    connection = await common.getConnection();
    let PromiseResult = await Promise.all([query(flowSql, [value.id, value.userId], connection), query(ruleSql, [value.id, value.userId], connection), query(pathsql, [value.id, value.userId], connection), query(landerSql, [value.id, value.userId], connection), query(offerSql, [value.id, value.userId], connection)]);

    let flowResult = PromiseResult[0];
    let ruleResult = PromiseResult[1];
    let pathResult = PromiseResult[2];
    let landerResult = PromiseResult[3];
    let offerResult = PromiseResult[4];

    if (PromiseResult.length) {
      //flow
      if (flowResult.length) {
        Object.assign(Result, flowResult[0]);
      }

      if (ruleResult.length) {
        for (let i = 0; i < ruleResult.length; i++) {
          //Rule
          if (ruleResult[i].parentId == Result.id) {
            ruleResult[i].paths = [];
            delete ruleResult[i].parentId;
            ruleResult[i].conditions = JSON.parse(ruleResult[i].conditions);
            Result.rules.push(ruleResult[i])

            for (let j = 0; j < pathResult.length; j++) {
              //path
              if (pathResult[j].parentId == ruleResult[i].id) {
                pathResult[j].offers = [];
                pathResult[j].landers = [];
                delete pathResult[j].parentId;

                //lander
                for (let k = 0; k < landerResult.length; k++) {
                  if (landerResult[k].parentId == pathResult[j].id) {
                    delete landerResult[k].parentId;
                    pathResult[j].landers.push(landerResult[k])
                  }
                }

                //offer
                for (let m = 0; m < offerResult.length; m++) {
                  if (offerResult[m].parentId == pathResult[j].id) {
                    delete offerResult[m].parentId;
                    pathResult[j].offers.push(offerResult[m])
                  }
                }

                Result.rules[i].paths.push(pathResult[j]);

              }
            }
          }

        }
      }
    }

    res.json({
      status: 1,
      message: 'success',
      data: Result
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
 * @api {post} /api/flows/ 新增flow
 * @apiName 新增flow
 * @apiGroup flow
 * @apiParam {String} name
 * @apiParam {String} country
 * @apiParam {Number} redirectMode
 */
router.post('/api/flows', async function (req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required(),
    idText: Joi.string().required(),
    rules: Joi.array().required(),
    hash: Joi.string(),
    type: Joi.number().required(),
    id: Joi.string().optional(),
    name: Joi.string().required(),
    country: Joi.string(),
    redirectMode: Joi.number()
  }).optionalKeys('id', 'hash', 'country', 'redirectMode');
  let connection;
  try {
    req.body.userId = req.parent.id;
    req.body.idText = req.parent.idText;
    req.body.type = 1;
    let value = await common.validate(req.body, schema);
    connection = await common.getConnection();
    let data = await saveOrUpdateFlow(req.user.id, value, connection);
    delete data.userId;
    data.deleted = 0;
    res.json({
      status: 1,
      message: 'success',
      data: data
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
 * @api {post} /api/flows/:id 编辑flow
 * @apiName  编辑flow
 * @apiGroup flow
 * @apiParam {String} name
 * @apiParam {String} country
 * @apiParam {Number} redirectMode
 */
router.post('/api/flows/:id', async function (req, res, next) {
  var schema = Joi.object().keys({
    id: Joi.number().required(),
    rules: Joi.array(),
    hash: Joi.string(),
    type: Joi.number(),
    name: Joi.string(),
    country: Joi.string(),
    redirectMode: Joi.number(),
    userId: Joi.number().required(),
    idText: Joi.string().required(),
    deleted: Joi.number()
  }).optionalKeys('rules', 'name', 'hash', 'type', 'country', 'redirectMode', 'deleted');
  let connection;
  try {
    req.body.userId = req.parent.id;
    req.body.idText = req.parent.idText;
    req.body.id = req.params.id;
    let value = await common.validate(req.body, schema);
    connection = await common.getConnection();
    //restore rule check
    if (value.deleted == 0) {
      let archivedArray = await checkFlowRelativeRulestatus(value.userId, value.id, connection);
      if (archivedArray.length) {
        return res.json({
          status: 0,
          message: 'restore Interrupt',
          data: {
            rules: archivedArray
          }
        });
      }
    }
    let data = await saveOrUpdateFlow(req.user.id, value, connection);
    delete data.userId;
    res.json({
      status: 1,
      message: 'success',
      data: data
    });
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});



async function checkFlowRelativeRulestatus(userId, flowId, connection) {
  let sql = `select  rule.id,rule.deleted  as archived  from Rule2Flow r2f
              left join Rule rule on r2f.ruleId = rule.id
              where r2f.flowId = ? and rule.userId = ?`;
  let result = await common.query(sql, [flowId, userId], connection);
  let archivedArray = [];//缓存删除状态的flow
  if (result.length) {
    for (let index = 0; index < result.length; index++) {
      if (result[index].archived == 1) {
        archivedArray.push(result[index]);
      }
    }
  }
  return archivedArray;
}


/**
 * @api {delete} /api/flows/:id 删除flow
 * @apiName  删除flow
 * @apiGroup flow
 */
router.delete('/api/flows/:id', async function (req, res, next) {
  var schema = Joi.object().keys({
    id: Joi.number().required(),
    userId: Joi.number().required(),
    name: Joi.string().optional().empty(""),
    hash: Joi.string().optional().empty("")
  });
  let connection;
  try {
    req.query.userId = req.parent.id;
    req.query.id = req.params.id;
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    //检查flow 是否绑定在某些 active campaign上
    let campaignResults = await common.query("select `id`,`name` from TrackingCampaign where deleted = ? and targetFlowId = ? and userId = ?", [0, value.id, value.userId], connection);
    if (campaignResults.length) {
      res.json({
        status: 0,
        message: "flow used by campaign!",
        data: {
          campaigns: campaignResults
        }
      });
      return;
    }
    let result = await common.deleteFlow(value.id, value.userId, connection);
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


async function saveOrUpdateFlow(subId, value, connection) {
  let flowIsInsert = false; // 当flow是新增 rule path 也必须是新增
  let beginTransaction = false;
  try {
    //check flow name exists
    if (value.name === "defaultName") {
      // skip check name if defaultName
    } else if (await common.checkNameExists(value.userId, value.id ? value.id : null, value.name, 4, connection)) {
      //check flow name existed
      throw new Error("Flow name exists");
    }

    let flowResult;
    // 用于缓存redis pub数据 {data:"",tag:""}
    connection.redisPubSlice = [];
    await common.beginTransaction(connection);
    beginTransaction = true;
    //Flow
    if (!value.id) {
      flowIsInsert = true;
      flowResult = await common.insertFlow(value.userId, value, connection)
    } else if (value && value.id) {
      await common.updateFlow(value.userId, value, connection)
    }

    let flowId = value.id ? value.id : (flowResult ? (flowResult.insertId ? flowResult.insertId : 0) : 0);
    if (!flowId) {
      throw new Error('Flow ID Lost');
    }
    //flowId
    value.id = flowId;

    if (value.rules && value.rules.length > 0) {

      //解除flow下的所有rules
      await common.deleteRule2Flow(flowId, connection);

      for (let i = 0; i < value.rules.length; i++) {
        // parse conditions array
        let rule = value.rules[i]
        if (rule.conditions) {
          rule.json = rule.conditions
          rule.object = conditionFormat(rule.conditions)
        }
        try {
          let ruleResult;
          if (flowIsInsert) {
            if (value.rules[i].id) delete value.rules[i].id;
          }
          //RULE
          if (!value.rules[i].id) {
            ruleResult = await common.insetRule(value.userId, value.rules[i], connection);
          } else {
            await common.updateRule(value.userId, value.rules[i], connection);
          }
          let ruleId = value.rules[i].id ? value.rules[i].id : (ruleResult ? (ruleResult.insertId ? ruleResult.insertId : 0) : 0);
          if (!ruleId) {
            throw new Error('Rule ID Lost');
          }
          //新建rule 和 flow 关系
          let c1 = common.insertRule2Flow(ruleId, flowId, value.rules[i].enabled ? 1 : 0,i, connection);

          //解除rule下的所有path
          let c2 = common.deletePath2Rule(ruleId, connection);

          await Promise.all([c1, c2]);

          value.rules[i].id = ruleId;

          //PATH
          if (value.rules[i].paths && value.rules[i].paths.length > 0) {
            for (let j = 0; j < value.rules[i].paths.length; j++) {
              let pathResult;
              if (flowIsInsert) {
                if (value.rules[i].paths[j].id) delete value.rules[i].paths[j].id;
              }
              if (!value.rules[i].paths[j].id) {
                pathResult = await common.insertPath(value.userId, value.rules[i].paths[j], connection);
              } else {
                await common.updatePath(value.userId, value.rules[i].paths[j], connection);
              }
              let pathId = value.rules[i].paths[j].id ? value.rules[i].paths[j].id : (pathResult ? (pathResult.insertId ? pathResult.insertId : 0) : 0);
              if (!pathId) {
                throw new Error('Path ID Lost');
              }
              await common.insertPath2Rule(pathId, ruleId, value.rules[i].paths[j].weight, value.rules[i].paths[j].enabled ? 1 : 0,j, connection);
              value.rules[i].paths[j].id = pathId;

              //解除path下的所有landers
              let d1 = common.deleteLander2Path(pathId, connection);

              //解除path下的所有offers
              let d2 = common.deleteOffer2Path(pathId, connection);

              await Promise.all([d1, d2]);

              //Lander
              let landersSlice = value.rules[i].paths[j].landers;
              let offersSlice = value.rules[i].paths[j].offers;

              if (!offersSlice || (offersSlice && offersSlice.length < 1)) {
                let err = new Error("Path must contain an offer");
                err.status = 200;
                throw err;
              }

              let p1 = insertOrUpdateLanderAndLanderTags(subId, value.userId, pathId, landersSlice, connection);
              let p2 = insertOrUpdateOfferAndOfferTags(subId, value.userId, value.idText, pathId, offersSlice, connection);

              await Promise.all([p1, p2]);

            }
          }

        } catch (e) {
          throw e;
        }
      }
    }

  } catch (err) {
    if (beginTransaction) {
      await common.rollback(connection);
    }
    throw err;
  }
  if (beginTransaction) {
    await common.commit(connection);
  }

  //处理缓存中的redis pub数据  =======begin
  let redisClient = redisPool;
  for (let index = 0; index < connection.redisPubSlice.length; index++) {
    redisClient.publish(setting.redis.channel, connection.redisPubSlice[index].data, connection.redisPubSlice[index].tag);
  }
  //处理缓存中的redis pub数据 =====end

  return value;
};

async function insertOrUpdateLanderAndLanderTags(subId, userId, pathId, landersSlice, connection) {
  if (landersSlice && landersSlice.length > 0) {
    for (let k = 0; k < landersSlice.length; k++) {
      let landerResult;
      if (!landersSlice[k].id) {
        landerResult = await common.insertLander(subId, userId, landersSlice[k], connection);

      } else {
        await common.updateLander(subId, userId, landersSlice[k], connection);
      }

      let landerId = landersSlice[k].id ? landersSlice[k].id : (landerResult ? (landerResult.insertId ? landerResult.insertId : 0) : 0);
      if (!landerId) {
        throw new Error('Lander ID Lost');
      }
      await common.insertLander2Path(landerId, pathId, landersSlice[k].weight,k, connection);
      landersSlice[k].id = landerId;

      //删除所有tags
      await common.updateTags(userId, landerId, 2, connection);

      if (landersSlice[k].tags && landersSlice[k].tags.length > 0) {
        for (let q = 0; q < landersSlice[k].tags.length; q++) {

          await common.insertTags(userId, landerId, landersSlice[k].tags[q], 2, connection);
        }
      }
    }
  }
}

async function insertOrUpdateOfferAndOfferTags(subId, userId, idText, pathId, offersSlice, connection) {
  if (offersSlice && offersSlice.length > 0) {
    for (let z = 0; z < offersSlice.length; z++) {
      let offerResult;

      if (!offersSlice[z].id) {
        let postbackUrl = setting.newbidder.httpPix + idText + "." + setting.newbidder.mainDomain + setting.newbidder.postBackRouter;
        offersSlice[z].postbackUrl = postbackUrl;
        offerResult = await common.insertOffer(subId, userId, idText, offersSlice[z], connection);
      } else {
        await common.updateOffer(subId, userId, offersSlice[z], connection);
      }

      let offerId = offersSlice[z].id ? offersSlice[z].id : (offerResult ? (offerResult.insertId ? offerResult.insertId : 0) : 0);
      if (!offerId) {
        throw new Error('Offer ID Lost');
      }
      await common.insertOffer2Path(offerId, pathId, offersSlice[z].weight,z, connection);
      offersSlice[z].id = offerId;

      //删除所有offer tags
      await common.updateTags(userId, offerId, 3, connection);
      //offer tags
      if (offersSlice[z].tags && offersSlice[z].tags.length > 0) {
        for (let p = 0; p < offersSlice[z].tags.length; p++) {
          await common.insertTags(userId, offerId, offersSlice[z].tags[p], 3, connection);
        }
      }
    }
  }
}

router.get('/api/conditions', async function (req, res, next) {
  //production
  let connection;
  try {
    connection = await common.getConnection();
    let result = await fillConditions(conditionResult, connection)
    res.json(result);
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


router.get('/api/cities', async function (req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required(),
    q: Joi.string().required().trim(),
  });
  req.query.userId = req.parent.id;
  //production
  let connection;
  try {
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    let result = await loadCityFromDB(value.q, connection)
    res.json(result);
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


router.get('/api/regions', async function (req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required(),
    q: Joi.string().required().trim(),
  });
  req.query.userId = req.parent.id;
  //production
  let connection;
  try {
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    let result = await loadStateRegionFromDB(value.q, connection)
    res.json(result);
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


router.get('/api/carriers', async function (req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required(),
    q: Joi.string().required().trim(),
  });
  req.query.userId = req.parent.id;
  //production
  let connection;
  try {
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    let result = await loadMobileCarrierFromDB(value.q, connection)
    res.json(result);
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});
router.get('/api/isps', async function (req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required(),
    q: Joi.string().required().trim(),
  });
  req.query.userId = req.parent.id;
  //production
  let connection;
  try {
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    let result = await loadIspFromDB(value.q, connection)
    res.json(result);
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});



async function saveOrUpdateRules() {

}

async function fillConditions(r, connection) {
  for (let i = 0; i < r.length; i++) {
    if (r[i].id == 'model') {
      r[i].fields[0].options = await loadBrandAndVersionFromDB(connection)
    } else if (r[i].id == 'browser') {
      r[i].fields[0].options = await loadBowerAndVersionFromDB(connection)
    } else if (r[i].id == 'connection') {
      r[i].fields[0].options = await loadConnectionType()
    } else if (r[i].id == 'country') {
      r[i].fields[0].options = await loadCountryFromDB(connection)
    } else if (r[i].id == 'region') {
      // do nothing
    } else if (r[i].id == 'city') {
      // do nothing
    } else if (r[i].id == 'varN') {
      //TODO: varN
    } else if (r[i].id == 'weekday') {
      r[i].fields[1].options = await loadTimezoneFromDB(connection)
    } else if (r[i].id == 'device') {
      r[i].fields[0].options = await loadDeviceType()
    } else if (r[i].id == 'iprange') {
      // do nothing
    } else if (r[i].id == 'isp') {
      // do nothing
    } else if (r[i].id == 'language') {
      r[i].fields[0].options = await loadLanguageFromDB(connection)
    } else if (r[i].id == 'carrier') {
      //do nothing
    } else if (r[i].id == 'os') {
      r[i].fields[0].options = await loadOsFromDB(connection)
    } else if (r[i].id == 'referrer') {
      // do nothing
    } else if (r[i].id == 'time') {
      r[i].fields[1].options = await loadTimezoneFromDB(connection)
    } else if (r[i].id == 'useragent') {
      //do nothing
    } else {
      //console.error("unsupported id type ", r[i].id)
    }
  }
  return r
}


// {
//     "value": "linux", "display": "Linux", "suboptions": [
//     {"value": "ubuntu", "display": "Ubuntu"},
//     {"value": "debian", "display": "Debian"},
//     {"value": "centos", "display": "Centos"},
//     {"value": "redhat", "display": "Redhat"},
//     {"value": "gentoo", "display": "Gentoo"},
//     {"value": "lfs", "display": "LFS"}
// ]
// }

async function loadBrandAndVersionFromDB(connection) {
  var sql = "select id, category, name from BrandWithVersions";
  let r = {};
  var r2 = [];
  let lines = await query(sql, [], connection);
  for (let i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (!r[line.category]) {
      r[line.category] = {
        value: `#ALL ${line.category}`,
        display: line.category,
        suboptions: []
      };
    }
    r[line.category].suboptions.push({
      value: line.name,
      display: line.name
    });
  }
  r2 = Object.values(r);
  return r2;
}

async function loadOsFromDB(connection) {
  var sql = "select id, category, name from OSWithVersions"
  let r = {}
  var r2 = []
  let lines = await query(sql, [], connection);
  for (let i = 0; i < lines.length; i++) {
    var line = lines[i]
    if (!r[line.category]) {
      r[line.category] = {
        value: `#ALL ${line.category}`,
        display: line.category,
        suboptions: []
      }
    }
    r[line.category].suboptions.push({
      value: line.name,
      display: line.name
    })
  }
  r2 = Object.values(r)

  // console.info(r2)
  return r2
}

async function loadBowerAndVersionFromDB(connection) {
  var sql = "select id, category, name from BrowserWithVersions"
  let r = {}
  var r2 = []

  let lines = await query(sql, [], connection);
  for (let i = 0; i < lines.length; i++) {
    var line = lines[i]
    if (!r[line.category]) {
      r[line.category] = {
        value: `#ALL ${line.category}`,
        display: line.category,
        suboptions: []
      }
    }
    r[line.category].suboptions.push({
      value: line.name,
      display: line.name
    })
  }
  r2 = Object.values(r)

  return r2
}

async function loadCountryFromDB(connection) {
  var sql = "select id, name as display, alpha3Code as value from Country where alpha3Code != 'ZZZ' "
  var r = [{
    id: 0,
    display: 'SameAsCampaign',
    value: '#SameAsCampaign'
  }];

  var r1 = await query(sql, [], connection);

  return r.concat(r1);
}


async function loadCityFromDB(name, connection) {
  var sql = "select id, name as display, name as value from City where `name` like '%" + name + "%' limit 5";
  var r = [];
  r = await query(sql, [], connection);
  return r
}


async function loadStateRegionFromDB(name, connection) {
  var sql = "select id, regionName as display, regionName as value from Regions where `regionName` like '%" + name + "%' limit 5";
  var r = [];
  r = await query(sql, [], connection);
  return r
}

async function loadIspFromDB(name, connection) {
  var sql = "select id, name as display,  name  as value from ISP where `name` like '%" + name + "%' group by name limit 5";
  var r = [];
  r = await query(sql, [], connection);

  return r
}

async function loadLanguageFromDB(connection) {
  var sql = "select id, name as display, code as value from Languages"

  var r = [];

  r = await query(sql, [], connection);

  return r
}

async function loadMobileCarrierFromDB(name, connection) {
  var sql = "select id, name as display, name as value from MobileCarriers where `name` like '%" + name + "%' group by name limit 5"
  var r = [];
  r = await query(sql, [], connection);
  return r;
}

async function loadTimezoneFromDB(connection) {
  var sql = "select id,utcShift as value, detail as display from Timezones"
  var r = [];
  r = await query(sql, [], connection);
  let result = [];
  for (let index = 0; index < r.length; index++) {
    result.push({
      value: r[index].value + "_" + r[index].id,
      display: r[index].display
    })
  }
  return result;
}

//TODO: update the values
async function loadConnectionType() {
  var r = [{
    value: "Broadband",
    display: "Broadband"
  }, {
    value: "Cable",
    display: "Cable"
  }, {
    value: "Mobile",
    display: "Mobile"
  }, {
    value: "Satellite",
    display: "Satellite"
  }, {
    value: "Unknown",
    display: "Unknown"
  }, {
    value: "Wireless",
    display: "Wireless"
  }, {
    value: "XDSL",
    display: "XDSL"
  }]
  return r
}

async function loadDeviceType() {
  var r = [{
    value: "DesktopsLaptop",
    display: "Desktops & Laptops"
  }, {
    value: "Cable",
    display: "Mobile Phones"
  }, {
    value: "Mobile",
    display: "Smart TV"
  }, {
    value: "Satellite",
    display: "Tablet"
  }]
  return r
}

function query(sql, params, connection) {
  return new Promise(function (resolve, reject) {
    connection.query(sql, params, function (err, result) {
      if (err) {
        return reject(err);
      }
      //turn true false string to boolean
      result.forEach(function (r) {
        for (let key in r) {
          if (r[key] == "true") {
            r[key] = true
          } else if (r[key] == "false") {
            r[key] = false
          }
        }
      });
      resolve(result);
    })
  });
}

function conditionFormat(c) {
  var r = []
  c.forEach(function (v) {
    if (v.id == 'model') {
      r.push(formatThreeKeys(v.id, v.operand, v.value))
    } else if (v.id == 'browser') {
      r.push(formatThreeKeys(v.id, v.operand, v.value))
    } else if (v.id == 'connection') {
      r.push(formatThreeKeys(v.id, v.operand, v.value))
    } else if (v.id == 'country') {
      r.push(formatThreeKeys(v.id, v.operand, v.value))
    } else if (v.id == 'region') {
      r.push(formatThreeKeys(v.id, v.operand, v.value))
    } else if (v.id == 'city') {
      r.push(formatThreeKeys(v.id, v.operand, v.value))
    } else if (v.id == 'varN') {
      // r.push(formatThreeKeys(v.id, v.operand, v.value))
    } else if (v.id == 'weekday') {
      r.push(formatWeekDay(v.id, v.operand, v.tz, v.weekday))
    } else if (v.id == 'device') {
      r.push(formatThreeKeys(v.id, v.operand, v.value))
    } else if (v.id == 'iprange') {
      r.push(formatIPValue(v.id, v.operand, v.value))
    } else if (v.id == 'isp') {
      r.push(formatThreeKeys(v.id, v.operand, v.value))
    } else if (v.id == 'language') {
      r.push(formatThreeKeys(v.id, v.operand, v.value))
    } else if (v.id == 'carrier') {
      r.push(formatThreeKeys(v.id, v.operand, v.value))
    } else if (v.id == 'os') {
      r.push(formatThreeKeys(v.id, v.operand, v.value))
    } else if (v.id == 'referrer') {
      r.push(formatTextValue(v.id, v.operand, v.value))
    } else if (v.id == 'time') {
      r.push(formatTime(v.id, v.operand, v.tz, v.starttime, v.endtime))
    } else if (v.id == 'useragent') {
      r.push(formatTextValue(v.id, v.operand, v.value))
    } else if (
      v.id == 'var1' ||
      v.id == 'var2' ||
      v.id == 'var3' ||
      v.id == 'var4' ||
      v.id == 'var5' ||
      v.id == 'var6' ||
      v.id == 'var7' ||
      v.id == 'var8' ||
      v.id == 'var9' ||
      v.id == 'var10'
    ) {
      r.push(formatThreeKeys(v.id, v.operand, v.value))
    } else {
      console.error("unsupported id type ", v.id)
    }
  })
  return [r]
}

function formatThreeKeys(id, operand, values) {
  var r = []
  r.push(id)
  if (operand == 'is') {
    r.push("in")
  } else {
    r.push("not in")
  }
  if (isArray(values))
    values.forEach(function (v) {
      r.push(v)
    })
  else
    r.push(values)
  return r
}

function formatThreeKeysWithErrorFormat(id, operand, values) {
  var r = []
  r.push(id)
  if (operand == 'is') {
    r.push("in")
  } else {
    r.push("not in")
  }
  if (isArray(values))
    values.forEach(function (v) {
      r.push(v.value)
    })
  else
    r.push(values)
  return r
}


function isArray(o) {
  return Object.prototype.toString.call(o) == '[object Array]';
}

function formatWeekDay(id, operand, tz, weekday) {
  var r = []
  r.push(id)
  if (operand == 'is') {
    r.push("weekday in")
  } else {
    r.push("weekday not in")
  }
  if (tz && tz.indexOf("_") > 0) {
    tz = tz.slice(0, tz.indexOf("_"))
  }
  r.push(tz)
  if (isArray(weekday))
    weekday.forEach(function (v) {
      r.push(v)
    })
  else
    console.error("weekday must be an array")
  return r
}

function formatTime(id, operand, tz, startTime, endTime) {
  var r = []
  r.push(id)
  if (operand == 'is') {
    r.push("time between")
  } else {
    r.push("time not between")
  }
  if (tz && tz.indexOf("_") > 0) {
    tz = tz.slice(0, tz.indexOf("_"))
  }
  r.push(tz)
  r.push(startTime)
  r.push(endTime)
  return r
}

function formatTextValue(id, operand, value) {
  let r = [id]
  if (operand == 'is') {
    r.push("contain")
  } else {
    r.push("not contain")
  }
  let m = value.split(/\r?\n/)
  r = r.concat(m)
  return r
}

function formatIPValue(id, operand, value) {
  let r = [id]
  if (operand == 'is') {
    r.push("ip in")
  } else {
    r.push("ip not in ")
  }
  let m = value.split(/\r?\n/)
  r = r.concat(m)
  return r
}


exports.router = router;
exports.saveOrUpdateFlow = saveOrUpdateFlow;
