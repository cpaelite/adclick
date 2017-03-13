var express = require('express');
var router = express.Router();
var common = require('./common');
var Joi = require('joi');
var _ = require('lodash');


/**
 * @api {get} /api/eventlog   user eventlog
 * @apiName  user eventlog
 * @apiGroup enentLog
 * @apiParam {String} from 
 * @apiParam {String} to 
 * @apiParam {Number} limit
 * @apiParam {Number} page
 * @apiParam {String} userId
 * @apiParam {String} tz
 * @apiParam {Number} actionType 
 * @apiParam {Number} entityType
 * 
 */
router.get('/api/eventlog', async function (req, res, next) {
    var schema = Joi.object().keys({
        from: Joi.string().required(),
        to: Joi.string().required(),
        limit: Joi.number().required().min(0),
        page: Joi.number().required(),
        userId: Joi.string().required(),
        tz: Joi.string().required(),
        actionType: Joi.number().required(),
        entityType: Joi.number().required(),
        user: Joi.number().required()
    });
    let connection;
   

    try {
        req.query.user= req.parent.id;
        let value = await common.validate(req.query, schema);
        let {
            limit,
            page,
            from,
            to,
            tz,
            user,
            userId,
            actionType,
            entityType
        } = value;
        limit = parseInt(limit)
        page = parseInt(page)
        let offset = (page - 1) * limit;

        let sqlTmp = "select user.`email` as user ,case log.`entityType` when 1 then \"Campaign\" when 2 then \"Lander\" when 3 then \"Offer\" when 4 then \"TrafficSource\" when 5 then \"AffiliateNetwork\" end as entityType,log.`entityName`,log.`entityId`,case log.`actionType` when 1 then \"Create\" when 2 then \"Change\" when 3 then \"Archive\" when 4 then \"Restore\" end as  action ,DATE_FORMAT(convert_tz(FROM_UNIXTIME(log.`changedAt`, \"%Y-%m-%d %H:%i:%s\"),'+00:00','<%= tz %>') ,'%Y-%m-%d %h:%i:%s %p') as changeAt  from `UserEventLog` log  inner join `User` user on user.id=log.`operatorId`  where log.`changedAt` >= (UNIX_TIMESTAMP(CONVERT_TZ('<%= from %>', '+00:00','<%= tz %>')))  " +
            " and log.`changedAt` <= (UNIX_TIMESTAMP(CONVERT_TZ('<%= to %>', '+00:00','<%= tz %>')))  ";

        if (userId !== "ALL") {
            sqlTmp += " and log.`operatorId` in  (select `id` from User where `idText`='<%= operatorId %>') ";
        }

        if (actionType !== 0) {
            sqlTmp += " and log.`actionType`=" + actionType;
        }

        if (entityType !== 0) {
            sqlTmp += " and log.`entityType`=" + entityType;
        }

        sqlTmp += " and log.`userId`=<%=user%>"

        let compiled = _.template(sqlTmp);

        let sql = compiled({
            from: from,
            tz: tz,
            to: to,
            user: user,
            operatorId:userId
        });
         
        let countSql = "select COUNT(*) as `total` from ((" + sql + ") as T)";

        sql += "  limit " + offset + "," + limit;
        
        connection = await common.getConnection();
        let result = await Promise.all([common.query(sql,[], connection), common.query(countSql,[], connection)]);
        res.json({
            status: 1,
            message: 'success',
            data: {
                totalRows: result[1][0] ? result[1][0].total : 0,
                rows: result[0]
            }
        });
    } catch (e) {
        next(e);
    }
    finally {
        if (connection) {
            connection.release();
        }

    }
});


router.get('/api/members', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        groupId: Joi.string().required()
    });
    let connection;
    try {
        req.query.userId = req.user.id;
        req.query.groupId = req.user.groupId;
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let results = [];
        let members = await common.query("select g.`userId`,user.`email`,user.`idText` from UserGroup g left join User user on user.`id`= g.`userId` where g.`groupId`= ? and g.`deleted`= 0", [value.groupId], connection);
        //如果是子账户请求 只显示他自己
        if (!req.owner) {
            for (let index = 0; index < members.length; index++) {
                if (members[index].userId == value.userId) {
                    results.push({ email: members[index].email, idText: members[index].idText });
                }
            }
        } else {
            for (let index = 0; index < members.length; index++) {
                results.push({ email: members[index].email, idText: members[index].idText });
            }
        }
        return res.json({
            status: 1,
            message: 'success',
            data: {
                members: results,
                owner:req.owner
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