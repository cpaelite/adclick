import express from 'express';
const router = express.Router();
import moment from 'moment';
import {
    validate
} from './common';
import Joi from 'joi';
import sequelize from 'sequelize';
const _ = require('lodash');
var common = require('./common');

export default router;

const {
    TrafficSourceSyncTask: TASK,
    TemplateTrafficSource: TPTS,
    ThirdPartyTrafficSource: TTS,
    TrafficSourceStatis: TSSTATIS,
    AdStatisReport: AdStatisReport
} = models;



/**
 *  @api {get} /api/third/traffic-source  获取ThirdPartyTrafficSource数据List
 *  @apiName 获取ThirdPartyTrafficSource数据List
 *
 */
router.get('/api/third/traffic-source', async function (req, res, next) {
    try {
        let schema = Joi.object().keys({
            userId: Joi.number().required()
        });
        req.query.userId = req.parent.id;
        let value = await validate(req.query, schema);
        let result = await TTS.findAll({
            attributes: ['id', 'name', 'trustedTrafficSourceId', 'token', ['userName', 'account'], 'password'],
            where: {
                userId: value.userId,
                deleted: 0
            }
        });
        let resultSlice = result.map(e => e.dataValues);
        return res.json({
            status: 1,
            message: 'success',
            data: {
                lists: resultSlice
            }
        });
    } catch (e) {
        next(e);
    }
});



/**
 *  @api {post} /api/third/traffic-source  新建ThirdPartyTrafficSource
 *  @apiName 新建ThirdPartyTrafficSource
 *  @apiGroup 3rdThirdTraffic
 *
 *  @apiParam {Number} trafficId
 *  @apiParam {String} name
 *  @apiParam {String} [token]
 *  @apiParam {String} [account]
 *  @apiParam {String} [password]
 */
router.post('/api/third/traffic-source', async function (req, res, next) {
    try {
        let schema = Joi.object().keys({
            userId: Joi.number().required(),
            name: Joi.string().required(),
            trafficId: Joi.number().required(),
            token: Joi.string().optional().allow(""),
            account: Joi.string().optional().allow(""),
            password: Joi.string().optional().allow(""),
        }).or('token', 'account').with('account', 'password');
        req.body.userId = req.parent.id;
        let value = await validate(req.body, schema);
        let tts = TTS.build({
            userId: value.userId,
            trustedTrafficSourceId: value.trafficId,
            name: value.name,
            createdAt: moment().unix()
        });
        if (value.token) {
            tts.token = value.token
        }
        if (value.account) {
            tts.userName = value.account
        }
        if (value.password) {
            tts.password = value.password
        }

        let result = await tts.save();

        value.id = result.id;
        delete value.userId;

        return res.json({
            status: 1,
            message: "success",
            data: value
        });
    } catch (e) {
        next(e);
    }
});



/**
 * @api {put} /api/third/traffic-source/:id   更新ThirdPartyTrafficSource
 *  @apiName 更新ThirdPartyTrafficSource
 *  @apiGroup 3rdThirdTraffic
 *
 *  @apiParam {Number} trafficId
 *  @apiParam {String} name
 *  @apiParam {String} [token]
 *  @apiParam {String} [account]
 *  @apiParam {String} [password]
 */
router.put('/api/third/traffic-source/:id', async function (req, res, next) {
    try {
        let schema = Joi.object().keys({
            id: Joi.number().required(),
            userId: Joi.number().required(),
            name: Joi.string().optional(),
            trafficId: Joi.string().optional(),
            token: Joi.string().optional().allow(""),
            account: Joi.string().optional().allow(""),
            password: Joi.string().optional().allow(""),
        }).or('token', 'account').with('account', 'password');
        req.body.userId = req.parent.id;
        req.body.id = req.params.id;
        let value = await validate(req.body, schema);
        let updateObject = {}
        if (value.name != undefined) {
            updateObject.name = value.name;
        }
        if (value.trafficId != undefined) {
            updateObject.trustedTrafficSourceId = value.trafficId;
        }
        if (value.token != undefined) {
            updateObject.token = value.token;
        }
        if (value.account != undefined) {
            updateObject.userName = value.account;
        }
        if (value.password != undefined) {
            updateObject.password = value.password;
        }

        await TTS.update(updateObject, {
            where: {
                id: value.id,
                userId: value.userId
            }
        });
        return res.json({
            status: 1,
            message: 'success'
        });
    } catch (e) {
        next(e);
    }
});



router.get('/api/traffic-source/tpl', async function (req, res, next) {
    try {
        let slice = [];
        let rows = await TPTS.findAll({
            attributes: ['id', 'name', 'apiReport', 'apiMode', 'apiParams', 'apiTimezones', 'apiMeshSize', 'apiDimensions', 'apiMaxTimeSpan', 'apiEarliestTime'],
            where: {
                apiReport: 1
            }
        });
        let resultSlice = rows.map(e => e.dataValues);

        for (let index = 0; index < resultSlice.length; index++) {
            if (resultSlice[index].apiParams) {
                resultSlice[index].apiParams = JSON.parse(resultSlice[index].apiParams);
            }
            if (resultSlice[index].apiTimezones) {
                resultSlice[index].apiTimezones = JSON.parse(resultSlice[index].apiTimezones);
            }
            if (resultSlice[index].apiDimensions) {
                resultSlice[index].apiDimensions = JSON.parse(resultSlice[index].apiDimensions)
            }
            slice.push(resultSlice[index]);
        }
        return res.json({
            status: 1,
            message: 'success',
            data: {
                lists: slice
            }
        });
    } catch (e) {
        next(e);
    }
});



/**
 * @api {post} /api/third/traffic-source/tasks
 * @apiName 新建trafficSourceSyncTask
 * @apiParam {Number} tsId
 * @apiParam {String} from
 * @apiParam {String} to
 * @apiParam {String} tzShift
 * @apiParam {String} tzParam
 * @apiParam {Number} tzId
 * @apiParam {String} meshSize 获取报告支持的最细粒度，0:minute;1:hour;2:day;3:week;4:month;5:year
 *
 * @apiGroup ThirdPartyTrafficSource
 *
 */
router.post('/api/third/traffic-source/tasks', async function (req, res, next) {
    try {
        let schema = Joi.object().keys({
            tsId: Joi.number().required(),
            userId: Joi.number().required(),
            from: Joi.string().required(),
            to: Joi.string().required(),
            tzShift: Joi.string().required(),
            tzParam: Joi.string().required(),
            tzId: Joi.number().required(),
            meshSize: Joi.string().required()
        });
        req.body.userId = req.parent.id;
        let value = await validate(req.body, schema);

        //限制新建task的频率
        let IntervalResult = await TTS.findOne({
            include: [{
                model: TPTS,
                attributes: ['apiInterval']
            }],
            where: {
                id: value.tsId
            },
            attributes: ['trustedTrafficSourceId']
        });

        let {
            dataValues: {
                TemplateTrafficSource: {
                    dataValues: {
                        apiInterval: Interval
                    }
                }
            }
        } = IntervalResult;

        let Results = await TASK.findAll({
            where: {
                userId: value.userId,
                thirdPartyTrafficSourceId: value.tsId
            },
            attributes: ['createdAt'],
            order: 'createdAt DESC',
            offset: 0,
            limit: 1
        });
        let begin = null;

        if (Results.length) {
            [{
                dataValues: {
                    createdAt: begin
                }
            }] = Results;
        }


        if (begin && (Interval && Interval > 0)) {
            if ((moment().unix() - begin) < Interval) {
                return res.json({
                    status: 0,
                    message: `please wait ${moment().unix() - (begin + Interval)}s`
                });
            }
        }

        let task = TASK.build({
            userId: value.userId,
            thirdPartyTrafficSourceId: value.tsId,
            tzShift: value.tzShift,
            tzId: value.tzId,
            tzParam: value.tzParam,
            statisFrom: value.from,
            statisTo: value.to,
            createdAt: moment().unix()
        });
        switch (value.meshSize) {
            case 'minute':
                task.meshSize = 0;
                break;
            case 'hour':
                task.meshSize = 1;
                break;
            case 'day':
                task.meshSize = 2;
                break;
            case 'week':
                task.meshSize = 3;
                break;
            case 'month':
                task.meshSize = 4;
                break;
            case 'year':
                task.meshSize = 5;
                break;
            default:
                task.meshSize = 2;
        }
        let result = await task.save();
        value.taskId = result.id;
        delete value.userId;
        return res.json({
            status: 1,
            message: 'success',
            data: value
        })
    } catch (e) {
        next(e);
    }

});

/**
 * @api {get}  /api/third/traffic-source/tasks
 * @apiName 获取trafficSourceSyncTask
 * @apiParam {Number} thirdPartyTrafficSourceId
 *
 * @apiGroup ThirdPartyTrafficSource
 */
router.get('/api/third/traffic-source/tasks', async function (req, res, next) {
    try {
        let schema = Joi.object().keys({
            thirdPartyTrafficSourceId: Joi.number().required(),
            userId: Joi.number().required()
        });
        req.query.userId = req.parent.id;
        let value = await validate(req.query, schema);
        let rows = await TASK.findAll({
            where: {
                userId: value.userId,
                thirdPartyTrafficSourceId: value.thirdPartyTrafficSourceId
            },
            //0:minute;1:hour;2:day;3:week;4:month;5:year
            attributes: ['id', 'status', 'message', 'tzId', 'tzShift', 'tzParam', ['thirdPartyTrafficSourceId', 'tsId'],
                [sequelize.literal('DATE_FORMAT(statisFrom,\'%Y-%m-%dT%H:%i\')'), 'from'],
                [sequelize.literal('DATE_FORMAT(statisTo,\'%Y-%m-%dT%H:%i\')'), 'to'],
                [sequelize.literal('case meshSize when 0 then \'minute\' when 1 then \'hour\' when 2 then \'day\' when 3 then \'week\' when 4 then \'month\' else \'year\' end '), 'meshSize']
            ],
            order: 'createdAt DESC',
            offset: 0,
            limit: 1
        });
        let resultSlice = rows.map(e => e.dataValues);
        return res.json({
            status: 1,
            message: 'success',
            data: resultSlice
        })
    } catch (e) {
        next(e);
    }

});


/**
 *  @api {get} /api/third/traffic-source/:id  获取ThirdPartyTrafficSource detail
 *  @apiName 获取ThirdPartyTrafficSource  detail
 *
 */
router.get('/api/third/traffic-source/:id', async function (req, res, next) {
    try {
        let schema = Joi.object().keys({
            userId: Joi.number().required(),
            id: Joi.number().required()
        });
        req.query.userId = req.parent.id;
        let value = await validate(req.query, schema);
        let result = await TTS.findOne({
            attributes: ['id', 'trustedTrafficSourceId', 'name', 'token', ['userName', 'account'], 'password'],
            where: {
                userId: value.userId,
                id: value.id
            }
        });
        return res.json({
            status: 1,
            message: 'success',
            data: result
        });

    } catch (e) {
        next(e);
    }
});



const mapping = {
    campaignId: 'tsCampaignId',
    websiteId: 'tsWebsiteId',
    v1: 'V1',
    v2: 'V2',
    v3: 'V3',
    v4: 'V4',
    v5: 'V5',
    v6: 'V6',
    v7: 'V7',
    v8: 'V8',
    v9: 'V9',
    v10: 'V10',
}

/**
 * @apiName  load TrafficSourceStatis list
 * @apiGroup ThirdPartyTrafficSource
 *
 * @apiParam {Number} taskId
 * @apiParam {String} groupBy
 * @apiParam {Number} page
 * @apiParam {Number} limit
 * @apiParam {String} order
 *
 */
router.get('/api/third/traffic-source-statis', async function (req, res, next) {
    let connection;
    try {
        let schema = Joi.object().keys({
            userId: Joi.number().required(),
            taskId: Joi.number().required(),
            groupBy: Joi.string().required(),
            page: Joi.number().required(),
            limit: Joi.number().required(),
            order: Joi.string().required(),
            campaignId: Joi.string().optional()
        });
        req.query.userId = req.parent.id;
        let value = await validate(req.query, schema);
        connection = await common.getConnection();
        //check groupby
        if (!_.has(mapping, value.groupBy)) {
            return res.json({
                status: 0,
                message: 'groupBy error'
            });
        }

        let {
            groupBy,
            limit,
            page,
            order
        } = value;
        // limit
        limit = parseInt(limit)
        if (!limit || limit < 0) limit = 1000;
        // offset
        page = parseInt(page)
        let offset = (page - 1) * limit;
        if (!offset) offset = 0;
        //order
        let orderBy = [];
        if (order) {
            if (order.slice(0, 1) === '-') {
                orderBy[1] = 'DESC';
                orderBy[0] = order.slice(1);
            } else {
                orderBy[1] = 'ASC';
                orderBy[0] = order;
            }
        }

        //select task get from to tz
        let {
            dataValues: taskObj
        } = await TASK.findOne({
                where: {
                    id: value.taskId
                },
                attributes: ['tzShift', 'statisFrom', 'statisTo', 'meshSize']
            });
        if (!taskObj) {
            throw new Error('taskId error');
        }



        let {
            statisFrom: from,
            statisTo: to,
            tzShift: tz,
            meshSize: meshSize
        } = taskObj;

        //v1~v10 campaignId/webSiteId/time的顺序依次赋值
        let IN = 5; //默认campaignId,time

        switch (groupBy) {
            case 'campaignId':
                IN = parseInt('101', 2);
                break;
            case 'websiteId':
                IN = parseInt('111', 2);
                break;
            case 'v1':
                IN = parseInt('1000000000101', 2);
                break;
            case 'v2':
                IN = parseInt('100000000101', 2);
                break;
            case 'v3':
                IN = parseInt('10000000101', 2);
                break;
            case 'v4':
                IN = parseInt('1000000101', 2);
                break;
            case 'v5':
                IN = parseInt('100000101', 2);
                break;
            case 'v6':
                IN = parseInt('10000101', 2);
                break;
            case 'v7':
                IN = parseInt('1000101', 2);
                break;
            case 'v8':
                IN = parseInt('100101', 2);
                break;
            case 'v9':
                IN = parseInt('10101', 2);
                break;
            case 'v10':
                IN = parseInt('1101', 2);
                break;
            default:
                IN = 5;
        }

        let orders = "";
        let whereConditon = `userId=${value.userId} and taskId=${value.taskId} and dimensions & ${IN} > 0 `;
        if (value.campaignId != undefined) {
            whereConditon += ` and campaignId='${value.campaignId}'`;
        }

        if (orderBy.length && (orderBy[0]) != 'roi' && orderBy[0] != 'ctr' && orderBy[0] != 'cvr') {
            orders = `order by ${orderBy[0]} ${orderBy[1]}`;
        } else {
            orders = `order by campaignId ASC`;
        }

        let tpl = ` select campaignId,campaignName,websiteId,status,
                    sum(impression) as impression,
                    sum(click) as click,
                    round(sum(Cost/1000000),2) as cost,
                    0 as visit, 0 as conversion,0 as revenue,
                    v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, time  from TrafficSourceStatis
                    where ${whereConditon} group by ${groupBy},time ${orders} `;

        let totaltpl = `select COUNT(*) as total from ((${tpl}) as T)`;
        tpl += ` limit ${offset},${limit}`;

        let [rows, totals] = await Promise.all([
            common.query(tpl, [], connection),
            common.query(totaltpl, [], connection),
        ]);



        let rawRows = [];
        let InSlice = [];
        for (let index = 0; index < rows.length; index++) {
            rawRows.push(rows[index]);
            let value = rows[index][groupBy]
            InSlice.push(value);
        }

        if (rawRows.length) {

            let where = ` where UserID=${value.userId} 
                   and ${mapping[groupBy]} in (?) `;

            //report

            if (value.campaignId != undefined) {

                where += ` and tsCampaignId='${value.campaignId}' `
            }

            //处理列存储tz 问题
            let tag = tz.slice(0, 1);
            let numberString = tz.slice(1);
            let slice = numberString.split(':');
            let intavlHour = `${tag}${parseInt(slice[0]) * 60 + parseInt(slice[1])}`

            //0:minute;1:hour;2:day;3:week;4:month;5:year
            let formatType = '%Y-%m-%d';
            let groupByKey = 'time'
            switch (meshSize) {
                // case 0:
                case 1:
                    formatType = '%Y-%m-%d %H';
                    break;
                case 2:
                    formatType = '%Y-%m-%d';
                    break;
                case 3:
                    formatType = '%Y-W%V';
                    break;
                case 4:
                    formatType = '%Y-%m';
                    break;
                case 5:
                    formatType = '%Y';
                    break;
                default:
                    formatType = '%Y-%m-%d';
            }
            from = moment(from).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            to = moment(to).startOf('day').format('YYYY-MM-DD HH:mm:ss');

            where += `and Timestamp >= (UNIX_TIMESTAMP(CONVERT_TZ('${from}','${tz}', '+00:00')) * 1000) and Timestamp < (UNIX_TIMESTAMP(CONVERT_TZ( '${to}','${tz}', '+00:00')) * 1000)`

            let group = ` group by ${groupBy},${groupByKey} `;

            let sql = `select ${mapping[groupBy]} as ${groupBy},
                      DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} MINUTE), '${formatType}') as ${groupByKey},
                      sum(Visits) as visit,
                      sum(Conversions) as conversion,
                      round(sum(Revenue/1000000),2) as revenue from adstatis 
                      ${where} ${group} `;
            let connection2 = await common.getConnection('m2');

            let reportRows = await common.query(sql, [InSlice], connection2);
            //释放链接
            if (connection2) {
                connection2.release();
            }

            for (let index = 0; index < reportRows.length; index++) {
                for (let i = 0; i < rawRows.length; i++) {
                    if (rawRows[i].time == reportRows[index][groupByKey]) {
                        rawRows[i] = _.assign(rawRows[i], reportRows[index])
                    }
                }
            }

            rawRows.map((e) => {
                e.ctr = (e.click / e.visits).toFixed(2);
                e.roi = ((e.revenue - e.cost) / e.cost * 100).toFixed(2);
                e.cvr = (e.conversion / e.impression * 100).toFixed(2);

                //数据修正
                for (let prop in e) {
                    if (e[prop] == null || e[prop] === 'null' || e[prop] === 'NaN' || e[prop] != e[prop]) {
                        e[prop] = 0;
                    }
                }
            });
            rawRows.sort(dynamicSort(order));
        }

        return res.json({
            status: 1,
            message: 'success',
            data: {
                rows: rawRows,
                totalRows: totals.length ? totals[0].total : 0
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



function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] == "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}