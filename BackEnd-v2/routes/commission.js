const common = require('./common');
const moment = require('moment');
var log4js = require('log4js');
var log = log4js.getLogger('commission');
import { logToUserFunctions } from './user_functions';
 
export default paymentFollowupWork;

async function logTocommission(paymentLogId) {
    let connect;
    try {
        connect = await common.getConnection();
        let refResult = await common.query("select ref.`id`,ref.`percent`,ref.`acquired`,pay.`amount` from UserPaymentLog pay inner join TemplatePlan plan on plan.`id`= pay.`goodsId` inner join UserReferralLog ref on pay.`userId`= ref.`referredUserId` where pay.`id`= ? and plan.`hasCommission`= 1", [paymentLogId], connect);
        
        if (refResult.length) {
            //注册1年之内
            if (moment.unix(refResult[0].acquired).add(1, 'y') > moment()) {
                await common.query("insert into UserCommissionLog (`referralId`,`paymentLogId`,`commission`,`createdAt`) values (?,?,?,?)", [refResult[0].id, paymentLogId, parseInt(refResult[0].amount * refResult[0].percent), parseInt(moment.utc().valueOf() / 1000)], connect);
            }
        } 
    } catch (e) {
        log.error("[commission.js][logTocommission][error]:", JSON.stringify(e));
        throw e;
    } finally {
        if (connect) {
            connect.release();
        }
    }
    return true;
}


//支付完成以后调用的后续流程
//1.logTocommission 查看该笔支付所属用户是否是通过推广进来的，要给推广用户佣金
//2.logToUserFunctions 更新该用户系统参数(不仅限于userLimit,domainLimit等 )
//3.update usergroup own privilege
async function paymentFollowupWork(paymentLogId) {
    try {
        await Promise.all([logTocommission(paymentLogId), logToUserFunctions(paymentLogId), updateUserGroupPrivilege(paymentLogId)]);
    } catch (e) {
        log.error("[commission.js][paymentFollowupWork][error]:", JSON.stringify(e));
        throw e;
    }
    return true;
}




async function updateUserGroupPrivilege(paymentLogId) {
    let connection;
    try {
        connection = await common.getConnection();
        let US = common.query("select `userId` from UserPaymentLog where `id`=?", [paymentLogId], connection);
        let configSlice = common.query("select `config` from RolePrivilege where `role`=?", [0], connection);
        let Result = await Promise.all([US, configSlice]);
        if (Result[1].length && Result[0].length) {
            await common.query("update UserGroup set privilege=? where `userId`=? and `role`=0", [Result[1][0].config, Result[0][0].userId], connection);
        }
    } catch (e) {
        log.error("[commission.js][updateUserGroupPrivilege][error]:", JSON.stringify(e));
        throw e;
    } finally {
        if (connection) {
            connection.release();
        }
    }
    return true;

}