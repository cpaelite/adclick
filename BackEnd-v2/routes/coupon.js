import express from 'express';
const router = express.Router();
import common from './common';
import moment from 'moment';
var Joi = require('joi');




/**
 * @api {post} /api/user/coupon 用户兑换优惠券
 * @apiName 用户兑换优惠券
 * @apiGroup coupon
 *
 * @apiParam {String} code
 */
router.post('/api/user/coupon', async function (req, res, next) {
    let connection;
    let err;
    try {
        var schema = Joi.object().keys({
            code: Joi.string().trim().required(),
            userId: Joi.number().required()
        });
        req.body.userId = req.user.id;
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        //check  同一张优惠券同一个用户不能重复使用
        let couponCount = await common.query('select count(*) as total from UserCouponLog where `couponId`=? and `userId` = ?', [value.code, value.userId], connection);
        if (couponCount.length && couponCount[0].total !== 0) {
            err = new Error("you have used this coupon");
            err.status = 200;
            throw err;
        }

        let couponSlice = await common.query("select a.`couponLimit`,a.`endDay`,a.`startDay`,a.`open`,a.`userLimit` ,p.`value`,p.`activity` from Coupon p inner join Activity a  on  a.`id` = p.`activity`  where p.`code` = ?  ", [value.code], connection);
        if (couponSlice.length == 0) {
            err = new Error("coupon code invalidate");
            err.status = 200;
            throw err;
        }
        if (couponSlice[0].open == 0) {
            err = new Error("activity closed");
            err.status = 200;
            throw err;
        }
        if (couponSlice[0].startDay < moment().unix() && moment().unix() < couponSlice[0].endDay) {


            // check 该活动的优惠码，每个用户最多可以用几张
            if (couponSlice[0].userLimit !== 0) {
                let userLimitResult = await common.query("select count(*) as total from UserCouponLog where `activity`= ? and `userId`= ?", [couponSlice[0].activity, value.userId], connection);
                if (userLimitResult.length) {
                    if (userLimitResult[0].total >= couponSlice[0].userLimit) {
                        err = new Error("arrived userLimit");
                        err.status = 200;
                        throw err;
                    }
                }
            }


            //check 该活动的优惠码，可以同时被多少用户使用
            if (couponSlice[0].couponLimit !== 0) {
                let couponLimitResult = await common.query("select count(*) as total from UserCouponLog where `activity` = ? and `couponId` =? ", [couponSlice[0].activity, value.code], connection);
                if (couponLimitResult.length) {
                    if (couponLimitResult[0].total >= couponSlice[0].couponLimit) {
                        err = new Error("arrived couponLimit");
                        err.status = 200;
                        throw err;
                    }
                }
            }


            let insertCouponLog = common.query("insert into UserCouponLog (`activity`,`couponId`,`activateDay`,`userId`,`status`) values(?,?,?,?,?)", [couponSlice[0].activity, value.code, moment().unix(), value.userId, 2], connection);
            let updateUserPlanfreeEvents = common.query("update UserBilling set `freeEvents`= freeEvents + ? where `userId`=? and `expired`= ?", [couponSlice[0].value, value.userId, 0], connection);
            await Promise.all([insertCouponLog, updateUserPlanfreeEvents]);
            return res.json({
                status: 1,
                message: "success"
            });

        } else {
            err = new Error("coupon code expired");
            err.status = 200;
            throw err;
        }


    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }

    }
});


module.exports = router;