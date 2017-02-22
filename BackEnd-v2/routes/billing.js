import express from 'express';
const router = express.Router();

export default router;

router.get('/api/Billing', async (req, res) => {
  res.json(
    {
      status: 1,
      message: 'success',
      data: {
        plan: {
          id: 1,
          name: "Agency",
          price: 399
        },
        statistic: {
          planCode: "NO PLAN",
          from: "19-01-2017",
          to: "19-02-2017",
          billedEvents: 1000,
          totalEvents: 1000,
          overageEvents: 1,
          overageCost: 0.999,
          includedEvents: 100000,
          remainEvents: 9999,
          freeEvents: 0,
        }
      }
    }
  )
})
