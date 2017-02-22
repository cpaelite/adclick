import express from 'express';
import sequelize from 'sequelize';
import paypal from '../util/paypal';

let export_router = express.Router();
let internal_router = express.Router();
export default export_router;

let {PaypalBillingAgreement: PBA, PaypalBillingPlan: PBP, PaypalBillingExcute: PBE} = models

internal_router.get('/plans', async (req, res, next) => {
  let plans = await PBP.findAll();
  res.json(plans);
})

internal_router.post('/:planId/agreement', async (req, res, next) => {
  var isoDate = new Date();
  isoDate.setSeconds(isoDate.getSeconds() + 4);
  isoDate.toISOString().slice(0, 19) + 'Z';
})

export_router.use('/api/payment/paypal', internal_router)
