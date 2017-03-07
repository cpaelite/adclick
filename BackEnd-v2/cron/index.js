import schedule from 'node-schedule'
import {cancelAgreement, updatePlan} from './jobs/executePaypal'

module.exports = function () {
  schedule.scheduleJob('0 1 * * *', async () => {
    try {
      await cancelAgreement();
    } catch (err) {
      console.log(err);
    }
  })

  schedule.scheduleJob('0 3 * * *', async () => {
    try {
      await updatePlan();
    } catch (err) {
      console.log(err);
    }
  })
}
