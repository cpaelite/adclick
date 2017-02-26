import express from 'express';
const router = express.Router();

export default router;

const {
  UserBilling: UB,
  TemplatePlan: TB
} = models;

router.get('/api/Billing', async (req, res) => {
  let {userId} = req;
  let billing = await UB.findOne({where: {userId}})
  if (!billing) {
    return res.json({
      status: 1,
      message: 'success',
      data: {}
    })
  }
  let template_plan = await TB.findOne({where: {id: billing.planId}})
  res.json(
    {
      status: 1,
      message: 'success',
      data: {
        plan: {
          id: template_plan.id,
          name: template_plan.name,
          price: template_plan.onSalePrice ||template_plan.normalPrice
        },
        statistic: {
          planCode: template_plan.name,
          billedEvents: billing.billedEvents,
          totalEvents: billing.totalEvents,
          overageEvents: billing.overageEvents,
          overageCost: 0,
          includedEvents: billing.includedEvents,
          remainEvents: (billing.includedEvents - billing.totalEvents),
          freeEvents: billing.freeEvents,
        }
      }
    }
  )
})
