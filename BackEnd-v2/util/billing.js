import sequelize from 'sequelize';
import moment from 'moment';
const {
  TemplatePlan: TP,
  UserBilling: UB,
  UserPaymentLog: UPL,
  UserPaymentMethod: UPM
} = models;

export async function addTrialPlan({userId}) {
  let count = await UPL.count({where: {userId}});
  if (count > 0) {
    throw new Error('already bought');
  }
  return await TP.sequelize.transaction(async (transaction) => {
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
}
