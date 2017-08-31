(function () {
  'use strict';

  angular.module('app')
    .controller('SigninCtrl', [
      '$rootScope', '$scope', '$auth', '$q', '$state', 'toastr', '$cookies', 'Profile', 'Permission', 'Confirmation', '$mdDialog',
      SigninCtrl
    ]);

  function SigninCtrl($rootScope, $scope, $auth, $q, $state, toastr, $cookies, Profile, Permission, Confirmation, $mdDialog) {
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
    $scope.verificationEmail = function() {
      Confirmation.get({
        email: $scope.user.email
      }, function(oData) {
        if(oData.status == 1) {
          $scope.noVerifiedEmail = false;
          $scope.emailHasSent = true;
        }
      });
    };
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

            // $mdDialog.show({
            //   bindToController: true,
            //   clickOutsideToClose: false,
            //   controllerAs: 'ctrl',
            //   focusOnOpen: false,
            //   controller: ['$mdDialog', function($mdDialog) {
            //     this.close = function() {
            //       $mdDialog.hide();
            //     };
            //   }],
            //   templateUrl: 'tpl/free-account-info-dialog.html?' + +new Date(),
            //   escapeToClose: false
            // });
          }

          $q.all(initPromises).then(initSucces);
          toastr.success('Login success!', {timeOut: 2000, positionClass: 'toast-top-center'});
          $scope.$emit('event:auth-loginSuccess');
        })
        .catch(function(response) {
          $scope.loginStatus = false;
          $scope.emailHasSent = false;
          $scope.noVerifiedEmail = false;
          // 1010: email has not been verified.
          if(response.data.status == '1010') {
              $scope.noVerifiedEmail = true;
          } else {
            toastr.error(response.data.message, { timeOut: 4000, positionClass: 'toast-top-center' });
          }
        });
    };

    $scope.resetPassword = function(){
      $state.go('access.reset-password');
    };
  }
})();
