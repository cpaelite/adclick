import express from 'express';
const router = express.Router();
export default router;

import url from 'url';
import paypal from '../util/paypal';

const {
  TemplatePlan: TP,
  UserBilling: UB,
  PaypalBillingPlan: PBP
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

router.post('/api/plans/:id', async (req, res, next) => {
  try {
    let {id} = req.params;
    let tempalte_plan = await TP.findById(id);
    if (!tempalte_plan) throw new Error('Not Found');
    let paypal_billing_plan = await PBP.findById(tempalte_plan.paypalPlanId);

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
    }

    res.json({
      status: 1,
      message: 'success',
      data: approval_url
    })
  } catch (e) {
    next(e)
  }
})
