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

import {addTrialPlan} from '../util/billing';

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
    let {subId: userId} = req;
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
    let {subId: userId} = req;
    await addTrialPlan({userId});
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
    let {subId: userId} = req;
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
