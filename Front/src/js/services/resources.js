angular.module('app')

.factory('Signin', ['$resource', function ($resource) {
    return $resource('/login');
}])
.factory('AccountCheck', ['$resource', function ($resource) {
    return $resource('/account/check');
}])
.factory('Signup', ['$resource', function ($resource) {
    return $resource('/register');
}])
.factory('TrackCampaign', ['$resource', function ($resource) {
    return $resource('/track/campaign/:id', {id: '@id'});
}])
.factory('Offer', ['$resource', function ($resource) {
    return $resource('/api/offer/:id', {id: '@id'});
}])
.factory('Lander', ['$resource', function ($resource) {
    return $resource('/lander/:id', {id: '@id'});
}])
.factory('Flow', ['$resource', function ($resource) {
    return $resource('/api/flow/:id', {id: '@id'});
}])
.factory('Rule', ['$resource', function ($resource) {
    return $resource('/rule/:id', {id: '@id'});
}])
.factory('TrafficSource', ['$resource', function ($resource) {
    return $resource('/traffic/source/:id', {id: '@id'});
}])
.factory('AffiliateNetwork', ['$resource', function ($resource) {
    return $resource('/api/affilate/:id', {id: '@id'});
}])
;
