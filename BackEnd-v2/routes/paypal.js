import express from 'express';
const router = express.Router();
export default router;
import moment from 'moment';
import paypal from '../util/paypal';
import Promise from 'bluebird';

const {
  PaypalBillingAgreement: PBA,
  PaypalBillingExecute: PBE,
  PaypalBillingPlan: PBP,
  UserBilling: UB,
  UserPaymentLog: UPL,
  UserPaymentMethod: UPM,
  TemplatePlan: TP
} = models;


router.get('/paypal/success', async function(req, res, next) {
  try {
    let {token} = req.query;
    let billingAgreement = await new Promise((resolve, reject) => {
      paypal.billingAgreement.execute(token, {}, (err, billingAgreement) => {
        err ? reject(err) : resolve(billingAgreement);
      })
    })

    let agreement = await PBA.findOne({where: {token}})
    let template_plan = await TP.findOne({where: {paypalPlanId: agreement.paypalPlanId}})
    let upm = await UPM.create({
      userId: agreement.userId,
      type: 1,
      paypalAgreementId: agreement.id,
      info: `${template_plan.name}`,
      changedAt: moment().unix(),
      deleted: 0
    });

    await PBA.sequelize.transaction(async (transaction) => {
      let upl = await UPL.create({
        userId: agreement.userId,
        paymentMethod: upm.id,
        amount: template_plan.onSalePrice,
        tax: 0,
        goodsType: 1,
        goodsId: template_plan.id,
        goodsVolume: 1,
        timeStamp: moment().unix()
      }, {transaction});

      let pbe = await PBE.create({
        userId: agreement.userId,
        agreementId: agreement.id,
        executedAt: (new Date()).getTime(),
        executeReq: token,
        executeResp: JSON.stringify(billingAgreement)
      }, {transaction});

      let ub = await UB.create({
        userId: agreement.userId,
        planId: template_plan.id,
        billedEvents: 0,
        totalEvents: 0,
        freeEvents: 0,
        overageEvents: 0,
        includedEvents: template_plan.eventsLimit,
        nextPlanId: 0, //TODO:
        nextPaymentMethod: 0, //TODO:
        expired: 0
      }, {transaction})
    })
    res.redirect('/#/setApp/subscriptions?message=success');
  } catch (e) {
    console.log(e);
    res.redirect('/#/setApp/subscriptions?message=cancel');
  }
})


router.get('/paypal/cancel', async function(req, res, next) {
    //TODO: update agreement status log to db
  res.redirect('/#/setApp/subscriptions?message=cancel');
})
