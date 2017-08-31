import express from 'express';
const router = express.Router();
import moment from 'moment';


var Joi = require('joi');
var common = require('./common');


export default router;

const {
  UserBilling: UB,
  TemplatePlan: TB,
  UserPaymentLog: UPL,
  User,
  UserBillDetail: UBD
} = models;


// router.get('/api/billing', async function(req, res, next) {
//   var schema = Joi.object().keys({
//     userId: Joi.number().required()
//   });
//   req.query.userId = req.user.id;
//   let connection;
//   try {
//     let value = await common.validate(req.query, schema);
//     connection = await common.getConnection();
//     let sql = `select DATE_FORMAT(FROM_UNIXTIME(bill.planStart), "%m/%d/%Y") as \`from\` ,
//                 (case bill.planEnd when  0 then 'Unlimited' else DATE_FORMAT(FROM_UNIXTIME(bill.planEnd), "%m/%d/%Y") end) as \`to\`,
//                 bill.totalEvents as totalEvents ,bill.includedEvents as includedEvents,plan.id as id,plan.name as name ,plan.price as price
//                 from UserBilling bill inner join UserPlan plan on bill.customPlanId=plan.id
//                 where bill.userId=? and bill.expired=0`;
//     let [spicialPlan] = await common.query(sql, [value.userId], connection);
//
//     if (!spicialPlan) {
//       return res.json({
//         status: 1,
//         message: 'success',
//         data: {
//           plan: {},
//           statistic: {
//
//           }
//         }
//       });
//     }
//
//
//     return res.json({
//       status: 1,
//       message: 'success',
//       data: {
//         plan: {
//           id: spicialPlan.id,
//           name: spicialPlan.name,
//           price: spicialPlan.price
//         },
//         statistic: {
//           planCode: spicialPlan.name,
//           from: spicialPlan.from,
//           to: spicialPlan.to,
//
//           totalEvents: spicialPlan.totalEvents,
//
//           includedEvents: spicialPlan.includedEvents
//
//         }
//       }
//     });
//   } catch (e) {
//     next(e);
//   } finally {
//     if (connection) {
//       connection.release();
//     }
//   }
// });

router.get('/api/billing', async(req, res) => {
  let {
    id: userId
  } = req.user;
  let billing = await UB.findOne({
    where: {
      userId,
      expired: 0
    }
  })
  if (!billing) {
    return res.json({
      status: 1,
      message: 'success',
      data: {}
    })
  }
  let template_plan = await TB.findOne({
    where: {
      id: billing.planId
    }
  })
  res.json({
    status: 1,
    message: 'success',
    data: {
      plan: {
        id: template_plan.id,
        name: template_plan.name,
        price: template_plan.onSalePrice
      },
      statistic: {
        planCode: template_plan.name,
        from: moment.unix(billing.planStart).format('M/D/YYYY'),
        to: moment.unix(billing.planEnd).format('M/D/YYYY'),
        billedEvents: billing.billedEvents,
        totalEvents: billing.totalEvents,
        overageEvents: billing.overageEvents,
        overageCost: ((template_plan.overageCPM / 1000000) * (billing.overageEvents / 1000)).toFixed(2),
        includedEvents: billing.includedEvents,
        remainEvents: billing.netEvents(),
        freeEvents: billing.freeEvents,
      }
    }
  })
})



router.get('/api/billing/info', async(req, res, next) => {
  try {
    let {
      id: userId
    } = req.user;
    let user_bill_detail = await UBD.findOne({
      where: {
        userId
      }
    }) || {}
    res.json({
      status: 1,
      message: 'success',
      data: {
        billingname: user_bill_detail.name,
        addressline1: user_bill_detail.address1,
        addressline2: user_bill_detail.address2,
        city: user_bill_detail.city,
        postalcode: user_bill_detail.zip,
        stateregion: user_bill_detail.region,
        country: user_bill_detail.country,
        ssntaxvatid: user_bill_detail.taxId
      }
    })
  } catch (e) {
    next(e)
  }
})

router.post('/api/billing/info', async(req, res, next) => {
  try {
    let {
      id: userId
    } = req.user;
    let {
      body
    } = req;
    let user_bill_detail = await UBD.findOne({
      where: {
        userId
      }
    });
    if (!user_bill_detail) user_bill_detail = UBD.build({
      userId
    });
    user_bill_detail.name = (body.billingname || "").trim();
    user_bill_detail.address1 = (body.addressline1 || "").trim();
    user_bill_detail.address2 = (body.addressline2 || "").trim();
    user_bill_detail.city = (body.city || "").trim();
    user_bill_detail.zip = (body.postalcode || "").trim();
    user_bill_detail.region = (body.stateregion || "").trim();
    user_bill_detail.country = (body.country || "").trim();
    user_bill_detail.taxId = (body.ssntaxvatid || "").trim();
    await user_bill_detail.save();
    res.json({
      status: 1,
      message: 'success'
    })
  } catch (e) {
    next(e)
  }
})

router.get('/api/invoices', async(req, res, next) => {
  let email = '',
    balance = 0;
  try {
    let {
      id: userId
    } = req.user;
    let user = await User.findById(userId);
    let user_bill_detail = await UBD.findOne({
      userId
    });
    if (!user) throw new Error('invalid user');
    email = user_bill_detail ? user_bill_detail.email : user.email;

    let billing = await UB.findOne({
      where: {
        userId,
        expired: 0
      }
    });
    if (!billing) throw new Error('no billing')

    let template_plan = await TB.findOne({
      where: {
        id: billing.planId
      }
    });
    if (!template_plan) throw new Error('no plan')
    balance = template_plan.onSalePrice
  } catch (e) {
    console.log(e)
  } finally {
    res.json({
      status: 1,
      message: 'success',
      data: {
        email,
        accountbalance: balance
      }
    })

  }
})

router.get('/api/payments', async(req, res, next) => {
  try {
    let {
      id: userId
    } = req.user;
    let upls = await UPL.findAll({
      where: {
        userId
      },
      order: 'timeStamp DESC',
      limit: 100
    })

    let result = upls.map(upl => {
      return {
        date: moment.unix(upl.timeStamp).format("MM/DD/YYYY"),
        amount: `$${upl.amount || 0}`,
        tax: `$${upl.tax || 0}`,
        totals: `$${(upl.amount || 0) + (upl.tax || 0)}`
      }
    })

    res.json({
      status: 1,
      message: 'success',
      data: {
        payments: result
      }
    })
  } catch (e) {
    next(e);
  }
})
