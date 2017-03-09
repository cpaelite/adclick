import express from 'express';
const router = express.Router();
export default router;
import moment from 'moment';
import paypal from '../util/paypal';
import Promise from 'bluebird';
import paymentFollowupWork from './commission';
const {
  PaypalBillingAgreement: PBA,
  PaypalBillingExecute: PBE,
  PaypalBillingPlan: PBP,
  UserBilling: UB,
  UserPaymentLog: UPL,
  UserPaymentMethod: UPM,
  TemplatePlan: TP,
  User,
  UserBillDetail: UBD
} = models;

router.get('/paypal/success', async function(req, res, next) {
  try {
    let {token} = req.query;
    let billingAgreement = await new Promise((resolve, reject) => {
      paypal.billingAgreement.execute(token, {}, (err, billingAgreement) => {
        err ? reject(err) : resolve(billingAgreement);
      })
    })

    // setup the new plan
    await PBA.sequelize.transaction(async (transaction) => {

      let agreement = await PBA.findOne({where: {token}});
      let template_plan = await TP.findOne({where: {paypalPlanId: agreement.paypalPlanId}});

      agreement.status = 1;
      agreement.save({transaction});


      let old_ub = await UB.findOne({
        where: {
          userId: agreement.userId,
          expired: 0
        }
      })

      // repeated token, ignore
      if (old_ub && old_ub.agreementId == agreement.id) {
        return res.redirect('/#/setApp/subscriptions');
      }

      // upgrade or downgrade plan, deactivate the previous plan
      if (old_ub && old_ub.agreementId !== agreement.id) {
        old_ub.expired = 1;
        await old_ub.save({transaction});
        let old_agreement

        let {agreementId} = old_ub;
        if (agreementId) {
          old_agreement = await PBA.findById(agreementId);
          if (old_agreement) {
            old_agreement.status = 6;
            await old_agreement.save({transaction})
          }
        }
      }


      let upm = await UPM.create({
        userId: agreement.userId,
        type: 1,
        paypalAgreementId: agreement.id,
        info: `${template_plan.name}`,
        changedAt: moment().unix(),
        deleted: 0
      }, {transaction});

      let user = await User.findById(agreement.userId);
      user.status = 1;
      await user.save({transaction})

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

      paymentFollowupWork(upl.id);

      let pbe = await PBE.create({
        userId: agreement.userId,
        agreementId: agreement.id,
        executedAt: new Date(),
        executeReq: token,
        executeResp: JSON.stringify(billingAgreement)
      }, {transaction});

      // update UserBilling adress
      let user_bill_detail = await UBD.findOne({where: {userId: agreement.userId}});
      if (!user_bill_detail) {
        let {shipping_address, payer} = billingAgreement
        user_bill_detail = UBD.build({
          userId: agreement.userId,
          email: payer.payer_info.email,
          name: shipping_address.recipient_name,
          address1: shipping_address.line1,
          address2: shipping_address.line2,
          city: shipping_address.city,
          zip: shipping_address.postal_code,
          region: shipping_address.state,
          country: shipping_address.country_code,
          taxId: ''
        });
        await user_bill_detail.save({transaction})
      }

      let events_offset = 0;
      if (old_ub) events_offset = old_ub.netEvents()

      let ub = await UB.create({
        userId: agreement.userId,
        agreementId: agreement.id,
        planId: template_plan.id,
        planPaymentLogId: upl.id,
        billedEvents: 0,
        totalEvents: 0,
        freeEvents: 0,
        overageEvents: 0,
        planStart: moment().startOf('day').unix(),
        planEnd: moment().add(1, 'month').add(5, 'day').startOf('day').unix(),
        includedEvents: template_plan.eventsLimit + events_offset,
        nextPlanId: 0,
        nextPaymentMethod: 0,
        expired: 0
      }, {transaction})
    })
    res.redirect('/#/setApp/subscriptions?message=success');
  } catch (e) {
    res.redirect('/#/setApp/subscriptions?message=cancel');
  }
})


router.get('/paypal/cancel', async function(req, res, next) {
  res.redirect('/#/setApp/subscriptions?message=cancel');
})
