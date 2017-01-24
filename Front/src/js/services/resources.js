angular.module('app')

  .factory('AccountCheck', ['$resource', function ($resource) {
    return $resource('/account/check');
  }])
  .factory('Report', ['$resource', function ($resource) {
    return $resource('/api/report');
  }])
  .factory('Campaign', ['$resource', function ($resource) {
    return $resource('/api/campaign/:id', {id: '@id'});
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
    return $resource('/api/traffic/:id', {id: '@id'});
  }])
  .factory('TrafficSources', ['$resource', function ($resource) {
    return $resource('/api/trafficsources');
  }])
  .factory('AffiliateNetwork', ['$resource', function ($resource) {
    return $resource('/api/affilate/:id', {id: '@id'});
  }])
  .factory('AffiliateNetworks', ['$resource', function ($resource) {
    return $resource('/api/networks');
  }])
  .factory('Condition', ['$resource', function ($resource) {
    return $resource('/api/conditions', {}, {'query':  {method:'GET', isArray:true}});
  }])
  .factory('Country', ['$resource', function ($resource) {
    return $resource('/api/countries', {}, {'query':  {method:'GET', isArray:true}});
  }])
;
