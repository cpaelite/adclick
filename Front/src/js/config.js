(function () {
  'use strict';

  angular.module('app')
    .factory('myInterceptor', ['$q', '$rootScope', function($q, $rootScope) {
      var interceptor = {
        request: function(config){
          return config;
        },
        response: function(response){
          var data = response.data;
          var toStr = Object.prototype.toString;
          
          // state 8: form validate
          if(toStr.apply(data) == '[object Object]' && data.state == 0) {
            // 
          }

          return response;
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
      $httpProvider.interceptors.push('myInterceptor'); 
    }])

    .config(['ChartJsProvider', function (ChartJsProvider) {
      // Configure all charts
      ChartJsProvider.setOptions({
        chartColors: ['#FF7F0E', '#2CA02C', '#7777FF'],
        responsive: false
      });

      // Configure all line charts
      ChartJsProvider.setOptions('line', {
        showLines: true
      });
    }]);

})();
