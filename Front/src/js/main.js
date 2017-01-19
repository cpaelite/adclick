(function () {
  'use strict';

  angular.module('app')
    .controller('MainCtrl', [
      '$scope', '$translate', '$mdDialog', '$auth', 'authService', '$rootScope', '$mdMedia', '$mdSidenav', 'Preferences', 'userPreferences',
      MainCtrl
    ]);

  function MainCtrl($scope, $translate, $mdDialog, $auth, authService, $rootScope, $mdMedia, $mdSidenav, Preferences, userPreferences) {
    // add ie/smart classes to html body
    $scope.isIE = !!navigator.userAgent.match(/MSIE/i);
    $scope.$watch(function () {
      return $mdMedia('gt-sm');
    }, function (gtsm) {
      $scope.screenGtSmall = gtsm;
    });

    // Hide or Show the 'left' sideNav area
    $scope.toggleLeftNav = function () {
      $mdSidenav('left').toggle();
    };


    // config
    $scope.app = {
      name: 'AdBund-AdClick',
      version: '0.0.1',
      // for chart colors
      color: {
        primary: '#7266ba',
        info: '#23b7e5',
        success: '#27c24c',
        warning: '#fad733',
        danger: '#f05050',
        light: '#e8eff0',
        dark: '#3a3f51',
        black: '#1c2b36'
      }
    }

    // translate
    $scope.lang = {isopen: false};
    $scope.langs = {en: 'English', zh: 'Chinese'};
    $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
    $scope.setLang = function (langKey, $event) {
      // set the current lang
      $scope.selectLang = $scope.langs[langKey];
      // You can change the language during runtime
      $translate.use(langKey);
      $scope.lang.isopen = !$scope.lang.isopen;
    };

    $rootScope.currentUser = null;
    $scope.showLogin = false;
    $scope.$on("event:auth-loginRequired", function () {
      // this event can be emitted when stateChangeStart or $http response with 401 status
      console.log("need auth: get event:auth-loginRequired");
      $scope.showLogin = true;
    });
    $scope.$on("event:auth-loginSuccess", function () {
      // this event can be emitted after user login
      $scope.showLogin = false;

      var payload = $auth.getPayload();
      if ($rootScope.currentUser && $rootScope.currentUser.id == payload.id) {
        $rootScope.currentUser = payload;
        authService.loginConfirmed(payload);
      } else {
        authService.loginConfirmed(payload, function () {
          return false;
        });
        $rootScope.currentUser = payload;

        /*// 用户配置信息
        Preferences.get(null, function (res) {
          if (res.status == 1) {
            $rootScope.preferences = res.data;
          }
        });*/
          $rootScope.preferences = userPreferences;

      }
    });
    // this event can be emitted when $http response with 403 status
    // or on '$stateChangeStart'
    $scope.$on("event:auth-forbidden", function () {
      $scope.$state.go('access.signin');
    });

    $scope.logout = function () {
      if ($auth.isAuthenticated()) {
        $auth.logout().then(function () {
          $scope.$state.go('access.signin');
        });
      } else {
        $scope.$state.go('access.signin');
      }
    };

    // home{
    $scope.toReport = function(){
        $scope.$state.go('app.report.campaign');
    };
    // setting
    $scope.toSetting = function(){
        // $scope.nav = false;
        // $scope.settingNav = true;
        $scope.$state.go('setApp.profile');
    };

    if ($auth.isAuthenticated()) {
      $scope.$broadcast("event:auth-loginSuccess");
    }
  }

})();
