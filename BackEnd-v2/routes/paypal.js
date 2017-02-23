import express from 'express';
const router = express.Router();
export default router;

import paypal from '../util/paypal';
import Promise from 'bluebird';

const {
  PaypalBillingAgreement: PBA,
  PaypalBillingExecute: PBE,
  PaypalBillingPlan: PBP,
  UserBilling: UB,
  TemplatePlan: TP
} = models;


router.get('/paypal/success', async function(req, res, next) {
  let {token} = req.query;
  let billingAgreement = await new Promise((resolve, reject) => {
    paypal.billingAgreement.execute(token, {}, (err, billingAgreement) => {
      err ? reject(err) : resolve(billingAgreement);
    })
  })

  let agreement = await PBA.findOne({where: {token}})

  await PBE.build({
    userId: agreement.userId,
    agreementId: agreement.id,
    executedAt: (new Date()).getTime(),
    executeReq: token,
    executeResp: JSON.stringify(billingAgreement)
  }).save()

  let template_plan = await TP.findOne({where: {paypalPlanId: agreement.paypalPlanId}})

  await UB.build({
    userId: agreement.userId,
    planId: template_plan.id,
    billedEvents: 0,
    totalEvents: 0,
    freeEvents: 0,
    overageEvents: 0,
    includedEvents: template_plan.eventsLimit,
    expired: 0
  }).save()

  res.redirect('/#/setApp/subscriptions?message=success')


})


router.get('/paypal/cancel', async function(req, res, next) {
  res.redirect('/#/setApp/subscriptions?message=cancel')
})
