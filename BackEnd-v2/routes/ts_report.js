import express from 'express';
const router = express.Router();
import moment from 'moment';
import { validate } from './common';
import Joi from 'Joi';

export default router;

const {
  TrafficSourceSyncTask: TASK,
    TemplateTrafficSource: TPTS,
    ThirdPartyTrafficSource: TTS,
    TrafficSourceStatis: TSSTATIS
} = models;



/**
 *  @apiName 获取ThirdPartyTrafficSource数据List
 *  @apiParam null
 */
// router.get('/api/third/traffic-source', async function (req, res) {
//     var result = {
//         "status": 1,
//         "message": "success",
//         "data": [{
//             id: 11,
//             trustedTrafficSourceId: 1,
//             name: "trafficTest01",
//             token: "3455sdfsdsfsd",
//         }, {
//             id: 12,
//             trustedTrafficSourceId: 2,
//             name: "trafficTest02",
//             account: "uu222@cc.com",
//             password: "222222"
//         }]
//     };

// });

/**
 *  @apiName 新建ThirdPartyTrafficSource
 *  @apiGroup 3rdThirdTraffic
 *
 *  @apiParam {Number} trafficId
 *  @apiParam {String} name
 *  @apiParam {String} [token]
 *  @apiParam {String} [account]
 *  @apiParam {String} [password]
 */
router.post('/api/third/traffic-source', async function (req, res,next) {
    try {
        let schema = Joi.object().keys({
            userId: Joi.number().required(),
            name: Joi.string().required(),
            trafficId: Joi.number().required(),
            token: Joi.string().optional().allow(""),
            account: Joi.number().optional().allow(""),
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