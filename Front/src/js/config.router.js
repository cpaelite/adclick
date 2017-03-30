(function () {
  'use strict';

  angular.module('app')
  .run(['$rootScope', '$state', '$stateParams', '$auth', '$urlRouter', 'Permission', '$window', run])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', config]);

  var $cookies;
  angular.injector(['ngCookies']).invoke(['$cookies', function(_$cookies_) {
    $cookies = _$cookies_;
  }]);

  function run($rootScope, $state, $stateParams, $auth, $urlRouter, Permission, $window) {

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    if($cookies.get('token') || $window.location.hash.indexOf('access') == -1) {
      Permission.get(null, function(res) {
        if (!res.status) {
          return;
        }
        $rootScope.permissions = res.data;
        $urlRouter.sync();
        $urlRouter.listen();
      });
    }

    $rootScope.$on('$stateChangeStart', function (ev, next) {
      var current_name = $state.current.name;
      console.log("state change start, current:", current_name, "change to:", next.name);

      if (!next.data)
        return;

      if (next.data.needAuth && !$auth.isAuthenticated()) {
        if (!current_name || current_name == "access.signup") {
          // landing or in signup
          $state.go('access.signin');
        } else {
          if (current_name != 'access.signin') {
            $rootScope.$broadcast('event:auth-loginRequired');
          }
          // hide the loading progress bar
          $rootScope.$broadcast('$stateChangeSuccess');
        }
        ev.preventDefault();
        return;
      }

      if (next.data.needRole && next.data.needRole.indexOf($rootScope.currentUser.role) == -1) {
        if (!current_name)
          $state.go('app.dashboard');
        $rootScope.$broadcast('event:auth-forbidden');
        ev.preventDefault();
        return;
      }
    });
  }

  function configReport(groupby) {
    return {
      url: '/' + groupby + '?frcpn',
      templateUrl: 'tpl/report.html',
      controller: 'ReportCtrl',
      params: {
        campaign: null,
        flow: null,
        offer: null,
        lander: null,
        traffic: null,
        affiliate: null,
        extgrpby: null,
        datetype: null,
        status: null,
        filters: {}
      }
    };
  }
  function config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/app/dashboard');

    $stateProvider
      .state('app', {
        abstract: true,
        url: '/app',
        templateUrl: "tpl/app.html",
        data: {}
      })
      .state('app.dashboard', {
        url: '/dashboard',
        templateUrl: 'tpl/dashBoard.html',
        controller: 'DashCtrl',
      })
      .state('app.report', {
        abstract: true,
        url: '/report',
        template: '<div ui-view class="fade-in-up"></div>',
      })
      .state('app.report.campaign', configReport('campaign'))
      .state('app.report.flow',     configReport('flow'))
      .state('app.report.offer',    configReport('offer'))
      .state('app.report.lander',   configReport('lander'))
      .state('app.report.traffic',  configReport('traffic'))
      .state('app.report.affiliate', configReport('affiliate'))

      .state('app.report.brand', configReport('brand'))
      .state('app.report.browserVersion', configReport('browserversion'))
      .state('app.report.browser', configReport('browser'))
      .state('app.report.city', configReport('city'))
      .state('app.report.connectionType', configReport('connectiontype'))
      .state('app.report.country', configReport('country'))
      .state('app.report.day', configReport('day'))
      .state('app.report.deviceType', configReport('devicetype'))
      .state('app.report.ip', configReport('ip'))
      .state('app.report.isp', configReport('isp'))
      .state('app.report.language', configReport('language'))
      .state('app.report.mobileCarrier', configReport('mobilecarrier'))
      .state('app.report.model', configReport('model'))
      .state('app.report.os', configReport('os'))
      .state('app.report.osVersion', configReport('oSVersion'))
      .state('app.report.domain', configReport('domain'))
      .state('app.report.region', configReport('region'))

      .state('app.report.tsWebsiteId', configReport('tsWebsiteId'))
      .state('app.report.v1', configReport('v1'))
      .state('app.report.v2', configReport('v2'))
      .state('app.report.v3', configReport('v3'))
      .state('app.report.v4', configReport('v4'))
      .state('app.report.v5', configReport('v5'))
      .state('app.report.v6', configReport('v6'))
      .state('app.report.v7', configReport('v7'))
      .state('app.report.v8', configReport('v8'))
      .state('app.report.v9', configReport('v9'))
      .state('app.report.v10', configReport('v10'))

      .state('app.report.conversion', {
        url: '/conversion',
        templateUrl: 'tpl/conversion.html',
        controller: 'ConversionCtrl'
      })
      .state('app.report.tsreport', {
        url: '/tsreport?trafficId',
        templateUrl: 'tpl/ts-report.html',
        controller: 'TsreportCtrl'
      })
      .state('app.report.tsOfferReport', {
        url: '/ts-offer-report',
        templateUrl: 'tpl/ts-offer-report.html',
        controller: 'TsOfferReportCtrl'
      })
      .state('app.rule', {
        url: '/rule',
        templateUrl: 'tpl/rule.html',
        controller: 'RuleCtrl',
      })
      .state('app.flow', {
        url: '/flow?id&dup&frcpn',
        templateUrl: 'tpl/flow-edit.html',
        controller: 'FlowEditCtrl',
      })
      .state('access', {
        url: '/access',
        template: '<div ui-view class="fade-in-right-big smooth"></div>'
      })
      .state('access.signin', {
        url: '/signin',
        templateUrl: 'tpl/signin.html',
        controller: 'SigninCtrl'
      })
      .state('access.reset-password', {
        url: '/reset-password',
        templateUrl: 'tpl/reset-password.html',
        controller: 'ResetPasswordCtrl'
      })
      .state('access.reset-password-info', {
        url: '/reset-password-info',
        templateUrl: 'tpl/reset-password-info.html',
        controller: 'ResetPasswordInfoCtrl'
      })
      .state('access.signup', {
        url: '/signup',
        templateUrl: 'tpl/signup.html',
        controller: 'SignupCtrl'
      })
      .state('access.signup-success', {
        url: '/signup-success',
        templateUrl: 'tpl/signup-success.html',
        controller: 'SignupCtrl'
      })
      .state('setApp', {
        abstract: true,
        url: '/setApp',
        templateUrl: "tpl/setApp.html",
        data: {}
      })
      .state('setApp.profile', {
        url: '/profile',
        templateUrl: 'tpl/profile.html',
        controller: 'ProfileCtrl',
        data: {}
      })
      .state('setApp.referralProgram', {
        url: '/referralProgram',
        templateUrl: 'tpl/referralProgram.html',
        controller: 'ReferralProgramCtrl',
        data: {}
      })
      .state('setApp.subscriptions', {
        url: '/subscriptions',
        templateUrl: 'tpl/subscriptions.html',
        controller: 'SubscriptionsCtrl',
        data: {}
      })
      .state('setApp.domain', {
        url: '/domain',
        templateUrl: 'tpl/domain.html',
        controller: 'DomainCtrl',
        data: {}
      })
      .state('setApp.setUp', {
        url: '/setUp',
        templateUrl: 'tpl/setUp.html',
        controller: 'SetUpCtrl',
        data: {}
      })
      .state('setApp.userManagement', {
        url: '/userManagement',
        templateUrl: 'tpl/userManagement.html',
        controller: 'UserManagementCtrl',
        data: {}
      })
      .state('setApp.botBlacklist', {
        url: '/botBlacklist',
        templateUrl: 'tpl/botBlacklist.html',
        controller: 'BotBlacklistCtrl',
        data: {}
      })
      .state('setApp.invoices', {
        url: '/invoices',
        templateUrl: 'tpl/invoices.html',
        controller: 'InvoicesCtrl',
        data: {}
      })
      .state('setApp.eventLog', {
        url: '/eventLog',
        templateUrl: 'tpl/eventLog.html',
        controller: 'EventLogCtrl',
        data: {}
      })
      .state('setApp.conversionUpload', {
        url: '/conversionUpload',
        templateUrl: 'tpl/conversionUpload.html',
        controller: 'ConversionUploadCtrl',
        data: {}
      });

      if($cookies.get('token') || window.location.hash.indexOf('access') == -1) {
        $urlRouterProvider.deferIntercept();
      }
  }
})();
