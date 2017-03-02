import schedule from 'node-schedule'
import executePaypal from './jobs/executePaypal'

const {
  PaypalBillingAgreement: PBA,
  PaypalBillingExecute: PBE,
  PaypalBillingPlan: PBP,
  UserBilling: UB,
  UserPaymentLog: UPL,
  UserPaymentMethod: UPM,
  TemplatePlan: TP
} = models;

module.exports = function () {
  const spec = '0 2 * * *'
  schedule.scheduleJob(spec, async () => {
    try {
      await executePaypal()
      console.log('Executed paypal successfully')
    } catch (err) {
      console.log(`An error occured when executing paypal: ${err}`)
    }
  })
}
