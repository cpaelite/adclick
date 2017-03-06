(function () {
  'use strict';

  angular.module('app')
    .controller('SignupCtrl', [
      '$scope', '$auth', '$state', '$location', 'toastr', 'AccountCheck',
      SignupCtrl
    ]);

  function SignupCtrl($scope, $auth, $state, $location, toastr, AccountCheck) {
    $scope.app.subtitle = 'Sign up';
    console.log($scope.$stateParams.t);
    var refToken = $location.$$search.refToken;
    if (refToken) {
      $scope.user = {
        refToken: refToken
      };
    }

    $scope.signup = function () {
      $scope.signupStatus = true;
      $auth.signup($scope.user, {ignoreAuthModule: true})
        .then(function (response) {
          $scope.signupStatus = false;
          if (response.status) {
            toastr.clear();
            toastr.success('Signup success!');
            $state.go('access.signup-success', {});
          } else {
            toastr.clear();
            toastr.error(response.message, {timeOut: 5000, positionClass: 'toast-top-center'});
          }
        })
        .catch(function (response) {
          $scope.signupStatus = false;
          toastr.error(response.data.message, {timeOut: 7000, positionClass: 'toast-top-center'});
        });
    };

    $scope.checkEmail = function () {
      function success(response) {
        if (response.data.exists) {
          $scope.form.email.$setValidity('check', false);
        } else {
          $scope.form.email.$setValidity('check', true);
        }
      }

      if ($scope.user && $scope.user.email) {
        AccountCheck.save({email: $scope.user.email}, success);
      }
    };

    $scope.goSignin = function() {
      $state.go('access.signin', {});
    };
  }

})();
