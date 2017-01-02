(function() {
  'use strict';

  angular.module('app')
    .controller('SigninCtrl', [
      '$scope', '$auth', '$state', 'toastr',
      SigninCtrl
    ]);

  function SigninCtrl($scope, $auth, $state, toastr) {
    $scope.app.subtitle = 'Sign in';
    $scope.user = {};
    $scope.login = function() {
      $auth.login($scope.user, { ignoreAuthModule: true })
        .then(function() {
            console.log("signin success");
            $scope.$emit('event:auth-loginSuccess');
            $state.go('app.offernetwork');
        })
        .catch(function(response) {
            console.log("error");
          toastr.error(response.data.message, { timeOut: 7000, positionClass: 'toast-top-center' });
        });
    };
  }
})();
