angular.module('app')
  .factory('AccountCheck', ['$resource', function ($resource) {
    return $resource('/account/check');
  }])
  .factory('Report', ['$resource', function ($resource) {
    return $resource('/api/report');
  }])
  .factory('Tsreport', ['$resource', function ($resource) {
    return $resource('/api/tsreport/:id', {}, {
      'update': {method:'PUT'}
    });
  }])
  .factory('ResetPwd', ['$resource', function ($resource) {
    return $resource('/user/resetpassword');
  }])
  .factory('Campaign', ['$resource', function ($resource) {
    return $resource('/api/campaigns/:id', {id: '@id'});
  }])
  .factory('Preference', ['$resource', function ($resource) {
    return $resource('/api/preferences');
  }])
  .factory('DashBoard', ['$resource', function ($resource) {
    return $resource('/dashboard/:id', {id: '@id'});
  }])
  .factory('Offer', ['$resource', function ($resource) {
    return $resource('/api/offers/:id', {id: '@id'});
  }])
  .factory('Lander', ['$resource', function ($resource) {
    return $resource('/api/landers/:id', {id: '@id'});
  }])
  .factory('Flow', ['$resource', function ($resource) {
    return $resource('/api/flows/:id', {id: '@id'});
  }])
  .factory('TrafficSource', ['$resource', function ($resource) {
    return $resource('/api/traffics/:id', {id: '@id'});
  }])
  .factory('TrafficTemplate', ['$resource', function ($resource) {
    return $resource('/api/traffic/tpl');
  }])
  .factory('AffiliateNetwork', ['$resource', function ($resource) {
    return $resource('/api/affiliates/:id', {id: '@id'});
  }])
  .factory('AffiliateTemplate', ['$resource', function ($resource) {
    return $resource('/api/affilate/tpl');
  }])
  .factory('Condition', ['$resource', function ($resource) {
    return $resource('/api/conditions', {}, {'query':  {method:'GET', isArray:true}});
  }])
  .factory('Country', ['$resource', function ($resource) {
    return $resource('/api/countries', {}, {'query':  {method:'GET', isArray:true}});
  }])
  .factory('Profile', ['$resource', function($resource) {
    return $resource('/api/profile')
  }])
  .factory('Password', ['$resource', function($resource) {
    return $resource('/api/password')
  }])
  .factory('Email', ['$resource', function($resource) {
    return $resource('/api/email')
  }])
  .factory('Referrals', ['$resource', function($resource) {
    return $resource('/api/referrals')
  }])
  .factory('Billing', ['$resource', function($resource) {
    return $resource('/api/billing')
  }])
  .factory('Plans', ['$resource', function($resource) {
    return $resource('/api/plans/:id', {id: '@id'})
  }])
  .factory('FreeTrial', ['$resource', function($resource) {
    return $resource('/api/free/trial/:id', {id: '@id'})
  }])
  .factory('Setup', ['$resource', function($resource) {
    return $resource('/api/setup')
  }])
  .factory('Domains', ['$resource', function($resource) {
    return $resource('/api/domains')
  }])
  .factory('DomainsValidatecname', ['$resource', function($resource) {
    return $resource('/api/domains/validatecname')
  }])
  .factory('Invitation', ['$resource', function($resource) {
    return $resource('/api/invitation/:id', {id: '@id'})
  }])
  .factory('Conversion', ['$resource', function($resource) {
    return $resource('/api/conversions')
  }])
  .factory('Invoices', ['$resource', function($resource) {
    return $resource('/api/invoices')
  }])
  .factory('Payments', ['$resource', function($resource) {
    return $resource('/api/payments')
  }])
  .factory('BillingInfo', ['$resource', function($resource) {
    return $resource('/api/billing/info')
  }])
  .factory('Paypal', ['$resource', function($resource) {
    return $resource('/api/paypal')
  }])
  .factory('DefaultPostBackUrl', ['$resource', function($resource) {
    return $resource('/api/postbackurl')
  }])
  .factory('BlackList', ['$resource', function ($resource) {
    return $resource('/api/blacklist/:id', {id: '@id'});
  }])
  .factory('EventLog', ['$resource', function ($resource) {
    return $resource('/api/eventlog');
  }])
  .factory('Tag', ['$resource', function ($resource) {
    return $resource('/api/tags');
  }])
  .factory('Timezone', ['$resource', function ($resource) {
    return $resource('/timezones');
  }])
  .factory('Plan', ['$resource', function ($resource) {
    return $resource('/api/user/plan');
  }])
  .factory('Member', ['$resource', function ($resource) {
    return $resource('/api/members');
  }])
  .factory('Conversion', ['$resource', function ($resource) {
    return $resource('/api/conversions');
  }])
  .factory('Group', ['$resource', function ($resource) {
    return $resource('/api/groups');
  }])
  .factory('TsReference', ['$resource', function ($resource) {
    return $resource('/api/tsreference/:id', {id: '@id'}, {
      'update': {method:'PUT'}
    });
  }])
  .factory('ThirdTraffic', ['$resource', function ($resource) {
    return $resource('/api/third-traffics');
  }])
  .factory('TsCampaign', ['$resource', function ($resource) {
    return $resource('/api/tsCampaign/:id');
  }])
  .factory('Coupon', ['$resource', function ($resource) {
    return $resource('/api/user/coupon');
  }])
  .factory('Permission', ['$resource', function($resource) {
    return $resource('/api/permission');
  }])
  .factory('Confirmation', ['$resource', function($resource) {
    return $resource('/user/resendconfirmation');
  }])
  .factory('QrpayUrl', ['$resource', function($resource) {
    return $resource('/api/qrpay/create');
  }])
  .factory('QrpayStatus', ['$resource', function($resource) {
    return $resource('/api/qrpay/status');
  }])
  .factory('ThirdAffiliate', ['$resource', function($resource) {
    return $resource('/api/third/affiliates/:id', {id: '@id'}, {
      'update': {method:'PUT'}
    });
  }])
  .factory('ThirdOffer', ['$resource', function($resource) {
    return $resource('/api/third/offers/:id', {id: '@id'});
  }])
  .factory('OfferTask', ['$resource', function($resource) {
    return $resource('/api/third/tasks');
  }])
  .factory('OfferImport', ['$resource', function($resource) {
    return $resource('/api/third/offersImport');
  }])
;
