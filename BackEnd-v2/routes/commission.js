const common = require('./common');
const moment = require('moment');
var log4js = require('log4js');
var log = log4js.getLogger('commission');

export default logTocommission;

async function logTocommission(paymentLogId) {
    let connect;
    try {
        connect = await common.getConnection();
        let refResult = await common.query("select ref.`id`,ref.`percent`,ref.`acquired`,pay.`amount` from UserPaymentLog pay  inner join UserReferralLog ref on pay.`userId`= ref.`referredUserId` where pay.`id`= ?", [paymentLogId], connect);
        if (refResult.length) {
            //注册1年之内
            if (moment.unix(refResult[0].acquired).add(1, 'y') > moment()) {
                await common.query("insert into UserCommissionLog (`referralId`,`paymentLogId`,`commission`,`createdAt`) values (?,?,?,?)", [refResult[0].id, paymentLogId, parseInt(refResult[0].amount * refResult[0].percent), parseInt(moment.utc().valueOf() / 1000)], connect);
            }
        }
    } catch (e) {
        log.error("[commission.js][logTocommission][error]:",JSON.stringify(e));
        throw e;
    } finally {
        if (connect) {
            connect.release();
        }
    }
    return true;
}
