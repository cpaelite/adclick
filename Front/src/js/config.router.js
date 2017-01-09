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
            .state('app.affiliatenetwork', {
                url: '/api/affilate',
                templateUrl: 'tpl/affiliateNetwork.html',
                controller: 'AffiliateNetworkCtrl',
                data: {}
            })
            .state('app.trackcampaign', {
                url: '/track/campaign',
                templateUrl: 'tpl/trackCampaign.html',
                controller: 'TrackCampaignCtrl',
                data: {}
            })
            .state('app.offer', {
                url: '/api/offer',
                templateUrl: 'tpl/offer.html',
                controller: 'OfferCtrl',
                data: {}
            })
            .state('app.lander', {
                url: '/lander',
                templateUrl: 'tpl/lander.html',
                controller: 'LanderCtrl',
                data: {}
            })
            .state('app.flow', {
                url: '/flow',
                templateUrl: 'tpl/flow.html',
                controller: 'FlowCtrl',
                data: {}
            })
            .state('app.trafficSource', {
                url: '/traffic/source',
                templateUrl: 'tpl/trafficSource.html',
                controller: 'TrafficSourceCtrl',
                data: {}
            })
            .state('app.rule', {
                url: '/rule',
                templateUrl: 'tpl/rule.html',
                controller: 'RuleCtrl',
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
            });
    }

})();
