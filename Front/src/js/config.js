(function () {
  'use strict';

  angular.module('app')
    .factory('HttpInterceptor', ['$q', '$rootScope', '$injector', function($q, $rootScope, $injector) {
      var interceptor = {
        request: function(config){
          if (config.params && config.params.errorFn) {
            config.errorFn = config.params.errorFn;
            delete config.params.errorFn;
          }
          return config;
        },
        response: function(response) {
          var data = response.data;
          var toStr = Object.prototype.toString;

          if(!response.config.errorFn && response.data.status == 0) {
            $injector.get('toastr').clear();
            var message = toStr.apply(data.message) == '[object String]' ? data.message : 'Error occurred!';
            $injector.get('toastr').error(message, {timeOut: 7000, positionClass: 'toast-top-center'});
            // return $q.reject(response);
          }
          return response;
        },
        responseError: function(response) {
          if(response.status === 405) {
            if($rootScope.changePlanStatus) {
              // return $q.reject(response);
            } else {
              $rootScope.changePlanStatus = true;
              $injector.get('ChangePlan').showDialog(-1, true, function() {}, {level: -1});
            }
          }
          return $q.reject(response);
        }
      };

      return interceptor;
    }]);
  angular.module('app')
    .config(['$mdThemingProvider', '$mdIconProvider', function ($mdThemingProvider, $mdIconProvider) {
      $mdIconProvider
        .defaultIconSet("./assets/svg/avatars.svg", 128)
        .icon("menu", "./assets/svg/menu.svg", 24)
        .icon("share", "./assets/svg/share.svg", 24)
        .icon("phone", "./assets/svg/phone.svg", 512);

      // Available palettes:
      //  red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green,
      //  lime, yellow, amber, orange, deep-orange, brown, grey, blue-grey
      $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('pink')
        .warnPalette('red');
      //.backgroundPalette('white');
    }])

    .config(['$httpProvider', function($httpProvider) {
      $httpProvider.interceptors.push('HttpInterceptor');
    }])

    .config(['ChartJsProvider', function (ChartJsProvider) {
      // Configure all charts
      ChartJsProvider.setOptions({
        chartColors: ['#2770ea', '#2CA02C', '#7777FF'],
        responsive: false
      });

      // Configure all line charts
      ChartJsProvider.setOptions('line', {
        showLines: true
      });
    }]);

})();
