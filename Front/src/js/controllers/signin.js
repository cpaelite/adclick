(function () {
  'use strict';

  angular.module('app')
    .controller('SigninCtrl', [
      '$scope', '$auth', '$state', 'toastr',
      SigninCtrl
    ]);

  function SigninCtrl($scope, $auth, $state, toastr) {
    $scope.app.subtitle = 'Log in';
    $scope.user = {};
    $scope.login = function() {
      $auth.login($scope.user, { ignoreAuthModule: true })
        .then(function() {
          toastr.clear();
          toastr.success('Login success!');
          $scope.$emit('event:auth-loginSuccess');
          $state.go('app.report.campaign');
        })
        .catch(function(response) {
          toastr.error(response.data.message, { timeOut: 7000, positionClass: 'toast-top-center' });
        });
    };
  }
})();
