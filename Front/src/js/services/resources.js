angular.module('app')

.factory('OfferNetwork', ['$resource', function ($resource) {
    return $resource('/offer/network/:id', {id: '@id'});
}])
.factory('TrackCampaign', ['$resource', function ($resource) {
    return $resource('/track/campaign/:id', {id: '@id'});
}])
.factory('Offer', ['$resource', function ($resource) {
    return $resource('/offer/:id', {id: '@id'});
}])
.factory('Lander', ['$resource', function ($resource) {
    return $resource('/lander/:id', {id: '@id'});
}])
.factory('Flow', ['$resource', function ($resource) {
    return $resource('/flow/:id', {id: '@id'});
}])
.factory('TrafficSource', ['$resource', function ($resource) {
    return $resource('/traffic/source/:id', {id: '@id'});
}])
.factory('Rule', ['$resource', function ($resource) {
    return $resource('/rule/:id', {id: '@id'});
}])
;
