import paypal from '../../util/paypal';
import Promise from 'bluebird';
import moment from 'moment';

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

export async function cancelAgreement() {
  let totalCount = await PBA.count({
    where: {
      status: 6
    }
  });
  let unit = 100;
  let ticks = Array(parseInt(totalCount / unit) + 1).fill().map((e, i) => i);
  let blocks = ticks.map(tick => {
    return PBA.findAll({
      where: {
        status: 6
      },
      offset: tick * unit,
      limit: unit,
      include: [
        {
          model: PBE,
          required: true
        }
      ]
    })
  })

  Promise.each(blocks, (block) => {
    return Promise.each(block, async (brick) => {
      PBA.sequelize.transaction(async transaction => {
        let paypalId = await brick.getPaypalId({transaction})
        if(!paypalId) throw new Error('missing execution record');
        try {
          await new Promise((resolve, reject) => {
            paypal.billingAgreement.cancel(paypalId, {note: 'Canceling the agreement'}, (error, res) => {
              error ? reject(error) : resolve(res)
            })
          })
        } catch (e) {
          if (e.response.name !== 'STATUS_INVALID') throw e;
        }
        brick.status = 5;
        await brick.save({transaction})
      })
    })
  })

}

export async function updatePlan() {
  let totalCount = await UB.count({
    where: {
      planEnd: moment().startOf('day').unix(),
      expired: 0,
      planId: {$ne: 0}
    }
  });
  let unit = 100;
  let ticks = Array(parseInt(totalCount / unit) + 1).fill().map((e, i) => i);

  let blocks = ticks.map(tick => {
    return UB.findAll({
      where: {
        planEnd: moment().startOf('day').unix(),
        expired: 0,
        planId: {$ne: 0}
      },
      offset: tick * unit,
      limit: unit,
      include: [
        {
          model: PBA,
          required: true
        },
        {
          model: TP,
          required: true
        }
      ]
    })
  })

  Promise.each(blocks, (block) => {
    return Promise.each(block, async (ub) => {
      ub.expired = 1;
      let user = await ub.getUser();
      try {
        let billingAgreement = await new Promise((resolve, reject) => {
          paypal.billingAgreement.execute(ub.PaypalBillingAgreement.token, {}, (err, billingAgreement) => {
            err ? reject(err) : resolve(billingAgreement);
          })
        })
        if (billingAgreement.state === 'Active') {
          let new_ub = await UB.create({
            userId: ub.userId,
            agreementId: ub.agreementId,
            planId: ub.planId,
            planPaymentLogId: ub.planPaymentLogId,
            billedEvents: 0,
            totalEvents: 0,
            freeEvents: 0,
            overageEvents: 0,
            planStart: moment().startOf('day').unix(),
            planEnd: moment().add(1, 'month').startOf('day').unix(),
            includedEvents: ub.TemplatePlan.eventsLimit + ub.netEvents(),
            nextPlanId: 0,
            nextPaymentMethod: 0,
            expired: 0
          })
          user.status = 1;
        } else {
          user.status = 0;
        }
      } catch (e) {
        ub.planEnd = moment().add(1, 'day').startOf('day').unix()
      } finally {
        await ub.save();
        await user.save();
      }
    })
  })

}
