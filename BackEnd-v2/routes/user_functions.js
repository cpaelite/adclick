const common = require('./common');
const moment = require('moment');
var log4js = require('log4js');
var log = log4js.getLogger('userFunctions');

export const logToUserFunctions= async function (paymentLogId,connection) {
    try {
        let planSlice = await common.query("select log.`userId`,plan.`domainLimit`,plan.`userLimit`,plan.`tsReportLimit`,plan.`retentionLimit` from UserPaymentLog log inner join TemplatePlan plan on log.`goodsId`=plan.`id` where log.`id`=?", [paymentLogId], connection);
        if (planSlice.length == 0) {
            throw new Error("paymentLogId error")
        }
        let config = JSON.stringify({ domainLimit: planSlice[0].domainLimit, userLimit: planSlice[0].userLimit, tsReportLimit: planSlice[0].tsReportLimit,retentionLimit:planSlice[0].retentionLimit });
        await common.query("insert into UserFunctions (userId,functions) VALUES (?,?) ON DUPLICATE KEY UPDATE functions=?", [planSlice[0].userId, config, config],connection);
    } catch (e) {
        log.error("[user_functions.js][logToUserFunctions][error]:", JSON.stringify(e));
        throw e;
    }  
    return true;
}


 