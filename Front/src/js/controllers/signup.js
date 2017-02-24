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
      $scope.user.refToken = refToken;
    }
    $scope.signup = function () {
      $auth.signup($scope.user, {ignoreAuthModule: true})
        .then(function (response) {
          if (response.status) {
            toastr.clear();
            toastr.success('Signup success!');
            $state.go('access.signin', {});
          } else {
            toastr.clear();
            toastr.error(response.message, {timeOut: 5000, positionClass: 'toast-top-center'});
          }
        })
        .catch(function (response) {
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

      if ($scope.user.email) {
        AccountCheck.save({email: $scope.user.email}, success);
      }
    };
  }

})();
