(function () {
  'use strict';

  angular.module('app')
    .controller('SigninCtrl', [
      '$rootScope', '$scope', '$auth', '$q', '$state', 'toastr', '$cookies', 'Profile', 'Permission',
      SigninCtrl
    ]);

  function SigninCtrl($rootScope, $scope, $auth, $q, $state, toastr, $cookies, Profile, Permission) {
    $scope.app.subtitle = 'Log in';

    var token = $cookies.get('token');
    var clientId = $cookies.get('clientId');

    if (token && clientId) {
      $auth.setToken(token);
      toastr.clear();
      toastr.success('Login success!');
      $scope.$emit('event:auth-loginSuccess');
      $state.go('app.dashboard');
      return;
    }

    $scope.user = {};
    $scope.login = function() {
      $scope.loginStatus = true;
      $auth.login($scope.user, { ignoreAuthModule: true })
        .then(function(oData) {
          $cookies.put('token', oData.data.token);
          toastr.clear();
          var initPromises = [], prms;

          // 用户配置信息
          var theProfile;
          prms = Profile.get(null, function (profile) {
            if (profile.status) {
              theProfile = profile.data;
            }
          }).$promise;
          initPromises.push(prms);

          // 用户权限信息
          var thePermission;
          prms = Permission.get(null, function (permission) {
            if (permission.status) {
              thePermission = permission.data;
            }
          }).$promise;
          initPromises.push(prms);

          function initSucces() {
            $scope.loginStatus = false;
            if (thePermission) {
              $rootScope.permissions = thePermission;
            }
            if (theProfile && theProfile.homescreen && theProfile.homescreen == "dashboard") {
              $scope.$state.go('app.dashboard');
            } else {
              $scope.$state.go('app.report.campaign');
            }
          }

          $q.all(initPromises).then(initSucces);
          toastr.success('Login success!');
          $scope.$emit('event:auth-loginSuccess');
        })
        .catch(function(response) {
          // 1010: email has not been verified. 
          $scope.loginStatus = false;
          toastr.error(response.data.message, { timeOut: 7000, positionClass: 'toast-top-center' });
        });
    };
  }
})();
