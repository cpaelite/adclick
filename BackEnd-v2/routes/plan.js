import express from 'express';
const router = express.Router();
export default router;
import sequelize from 'sequelize';
import moment from 'moment';
import url from 'url';
import paypal from '../util/paypal';

const {
  TemplatePlan: TP,
  UserBilling: UB,
  PaypalBillingPlan: PBP,
  PaypalBillingAgreement: PBA,
  UserPaymentLog: UPL,
  UserPaymentMethod: UPM
} = models;

router.get('/api/plans', async (req, res, next) => {
  try {
    let plans = await TP.findAll({where: {hidden: 0}})
    res.json({
      status: 1,
      message: 'success',
      data: {plan: plans}
    })
  } catch (e) {
    next(e)
  }
})

router.get('/api/trial_plans', async (req, res, next) => {
  try {
    let {userId} = req;
    let count = await UPL.count({where: {userId}})
    res.json({
      status: 1,
      message: 'success',
      data: count === 0
    })
  } catch (e) {
    next(e)
  }
})

router.post('/api/trial_plans', async (req, res, next) => {
  try {
    let {userId} = req;
    let count = await UPL.count({where: {userId}});
    if (count > 0) throw new Error('already bought');
    await TP.sequelize.transaction(async (transaction) => {
      let trial_plan = await TP.findOne({paypalId: 0})
      if (!trial_plan) throw new Error('no trial plan');
      let upm = await UPM.create({
        userId,
        type: 0,
        paypalAgreementId: 0,
        info: `trial plan fro userId#${userId}`,
        changedAt: moment().unix(),
        deleted: 0
      }, {transaction})

      let upl = await UPL.create({
        userId,
        paymenMethod: upm.id,
        amount: 0,
        tax: 0,
        goodsType: 1,
        goodsId: trial_plan.id,
        goodsVolume: 1,
        timeStamp: moment().unix()
      }, {transaction})

      let ub = await UB.create({
        userId,
        planId: trial_plan.id,
        nextPlanId: 0,
        nextPaymentMethod: 0,
        planStart:  moment().unix(),
        planEnd: moment().add(trial_plan.regularFrequencyInterval, trial_plan.regularFrequency).unix(),
        billedEvents: 0,
        totalEvents: 0,
        freeEvents: 0,
        overageEvents: 0,
        includedEvents: trial_plan.eventsLimit,
        expired: 0
      }, {transaction})
      return ub;
    })
    res.json({
      status: 1,
      message: 'success',
      data: ''
    })
  } catch (e) {
    next(e)
  }
})

router.post('/api/plans/:id', async (req, res, next) => {
  try {
    let {id} = req.params;
    let {userId} = req;
    let template_plan = await TP.findById(id);
    if (!template_plan) throw new Error('Not Found');
    let paypal_billing_plan = await PBP.findById(template_plan.paypalPlanId);

    var isoDate = new Date();
    isoDate.setSeconds(isoDate.getSeconds() + 4);
    isoDate.toISOString().slice(0, 19) + 'Z';
    let billingAgreementAttributes = {
      "name": paypal_billing_plan.name,
      "description": `Agreement for ${paypal_billing_plan.description}`,
      "start_date": isoDate,
      "plan": {
          "id": paypal_billing_plan.paypalId
      },
      "payer": {
          "payment_method": "paypal"
      },
    }


    let billingAgreement = await new Promise((resolve, reject) => {
      paypal.billingAgreement.create(billingAgreementAttributes, (err, agreement) => {
        err ? reject(err) : resolve(agreement)
      })
    })

    for (var index = 0; index < billingAgreement.links.length; index++) {
        if (billingAgreement.links[index].rel === 'approval_url') {
            var approval_url = billingAgreement.links[index].href;
            var token = url.parse(approval_url, true).query.token;
        }
        if (billingAgreement.links[index].rel === 'execute') {
            var execute_url = billingAgreement.links[index].href;
        }
    }

    res.json({
      status: 1,
      message: 'success',
      data: approval_url
    })

    PBA.build({
      name: billingAgreement.name,
      description: billingAgreement.description,
      token,
      userId,
      paypalPlanId: paypal_billing_plan.id,
      createdAt: new Date(),
      approvalUrl: approval_url,
      executeUrl: execute_url,
      createReq: JSON.stringify(billingAgreementAttributes),
      createResp: JSON.stringify(billingAgreement),
      status: 1
    }).save()

  } catch (e) {
    next(e)
  }
})
