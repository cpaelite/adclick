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

  function config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/app/track/campaign');

    $stateProvider
      .state('app', {
        abstract: true,
        url: '/app',
        templateUrl: "tpl/app.html"
      })
      .state('app.dashboard', {
        url: '/dashboard',
        templateUrl: 'tpl/dashBoard.html',
        controller: 'DashCtrl',
        data: {}
      })
      .state('app.report', {
        abstract: true,
        url: '/report',
        template: '<div ui-view class="fade-in-up"></div>',
        data: {}
      })
      .state('app.report.campaign', {
        url: '/campaign',
        templateUrl: 'tpl/report.html',
        controller: 'ReportCtrl',
        data: {}
      })
      .state('app.report.flow', {
        url: '/flow',
        templateUrl: 'tpl/report.html',
        controller: 'ReportCtrl',
        data: {}
      })
      .state('app.report.offer', {
        url: '/offer',
        templateUrl: 'tpl/report.html',
        controller: 'ReportCtrl',
        data: {}
      })
      .state('app.report.lander', {
        url: '/lander',
        templateUrl: 'tpl/report.html',
        controller: 'ReportCtrl',
        data: {}
      })
      .state('app.report.trafficSource', {
        url: '/trafficsource',
        templateUrl: 'tpl/report.html',
        controller: 'ReportCtrl',
        data: {}
      })
      .state('app.rule', {
        url: '/rule',
        templateUrl: 'tpl/rule.html',
        controller: 'RuleCtrl',
        data: {}
      })
      .state('app.flow', {
        url: '/flow?id',
        templateUrl: 'tpl/flow-edit.html',
        controller: 'FlowEditCtrl',
        data: {}
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
        templateUrl: "tpl/setApp.html"
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
      });
  }
})();
