import paypal from 'paypal-rest-sdk'
import config from '../config/paypal'

paypal.configure(config)

export default paypal;
