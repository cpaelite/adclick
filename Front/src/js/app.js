(function () {
  'use strict';

  // Prepare the 'app' module for subsequent registration of controllers and delegates
  angular.module('app', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ngStorage',
    'ui.router',
    'ui.bootstrap',
    'pascalprecht.translate',
    'ngMaterial',
    'md.data.table',
    'satellizer',
    'toastr',
    'http-auth-interceptor',
    'monospaced.elastic',
    'angularFileUpload',
    'chart.js'
  ]);

})();
