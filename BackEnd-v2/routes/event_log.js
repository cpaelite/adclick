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
 * @apiParam {Number} userId
 * @apiParam {String} tz
 * 
 */
router.get('/api/eventlog',async function(req,res,next){
    var schema = Joi.object().keys({
        from: Joi.string().required(),
        to: Joi.string().required(),
        limit: Joi.number().required().min(0),
        page: Joi.number().required(),
        userId: Joi.number().required(),
        tz:Joi.string().required()
    });
    let connection;

    try {
        let value = await common.validate(req.query, schema);
        let {
            limit,
            page,
            from,
            to,
            tz,
            userId
        } = value;
        limit = parseInt(limit)
        page = parseInt(page)
        let offset = (page - 1) * limit;
        

        let compiled =_.template("select user.`email`,log.`entityType`,log.`entityName`,log.`entityId`,log.`actionType`,log.`changedAt` from `UserEventLog` log  inner join `User` user on user.id=log.`userId`  where log.`changedAt` >= (UNIX_TIMESTAMP(CONVERT_TZ('<%= from %>', '+00:00','<%= tz %>')))  " +
        " and log.`changedAt` <= (UNIX_TIMESTAMP(CONVERT_TZ('<%= to %>', '+00:00','<%= tz %>'))) and log.`userId`=<%= userId %> limit <%= offset %>,<%= limit %>");

        let sql =compiled({
            from:from,
            tz:tz,
            to:to,
            offset:offset,
            limit:limit,
            userId:userId
        });

        console.log(sql)
        connection = await common.getConnection();
        let result = await query(sql, connection);
        res.json({
            status: 1,
            message: 'success',
            data: result.length ? result : []
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

function query(sql,connection){
    return new Promise(function(resolve,reject){
       connection.query(sql,function(err,result){
           if(err){
               return reject(err);
           }
       resolve(result);
       })
    });
}

module.exports=router;