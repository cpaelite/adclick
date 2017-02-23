(function () {
  'use strict';

  angular.module('app')
    .run(['$rootScope', '$state', '$stateParams', '$auth', run])
    .config(['$stateProvider', '$urlRouterProvider', config]);

  function run($rootScope, $state, $stateParams, $auth) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

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
          $state.go('app.offernetwork');
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
        from: null,
        to: null
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
        data: { needAuth: true }
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
      .state('app.report.conversion', {
        url: '/conversion',
        templateUrl: 'tpl/conversion.html',
        controller: 'ConversionCtrl'
      })
      .state('app.report.tsreport', {
        url: '/tsreport?trafficId',
        templateUrl: 'tpl/tsreport.html',
        controller: 'TsreportCtrl'
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
      .state('access.signup', {
        url: '/signup',
        templateUrl: 'tpl/signup.html',
        controller: 'SignupCtrl'
      })
      .state('setApp', {
        abstract: true,
        url: '/setApp',
        templateUrl: "tpl/setApp.html",
        data: { needAuth: true }
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
  }
})();
