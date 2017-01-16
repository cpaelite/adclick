angular.module('app')

  .factory('AccountCheck', ['$resource', function ($resource) {
    return $resource('/account/check');
  }])
  .factory('Report', ['$resource', function ($resource) {
    return $resource('/report');
  }])
  .factory('Campaign', ['$resource', function ($resource) {
    return $resource('/api/campaigns/:id', {id: '@id'});
  }])
  .factory('Preferences', ['$resource', function ($resource) {
    return $resource('/preferences');
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
  .factory('Rule', ['$resource', function ($resource) {
    return $resource('/api/rules/:id', {id: '@id'});
  }])
  .factory('TrafficSource', ['$resource', function ($resource) {
    return $resource('/traffic/source/:id', {id: '@id'});
  }])
  .factory('AffiliateNetwork', ['$resource', function ($resource) {
    return $resource('/affilate/:id', {id: '@id'});
  }])
;
