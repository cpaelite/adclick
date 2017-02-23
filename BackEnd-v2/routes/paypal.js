import express from 'express';
const router = express.Router();
export default router;

import paypal from '../util/paypal';


router.get('/paypal/success', async function(req, res, next) {
  res.redirect('/#/setApp/subscriptions?message=success')
})


router.get('/paypal/cancel', async function(req, res, next) {
  res.redirect('/#/setApp/subscriptions?message=cancel')
})
