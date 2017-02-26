(function () {
  'use strict';

  angular.module('app')
    .controller('SigninCtrl', [
      '$scope', '$auth', '$state', 'toastr', '$cookies',
      SigninCtrl
    ]);

  function SigninCtrl($scope, $auth, $state, toastr, $cookies) {
    $scope.app.subtitle = 'Log in';

    var token = $cookies.get('token');
    var clientId = $cookies.get('clientId');

    if (token && clientId) {
      $auth.setToken(token);
      toastr.clear();
      toastr.success('Login success!');
      $scope.$emit('event:auth-loginSuccess');
      $state.go('app.report.campaign');
    }

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
