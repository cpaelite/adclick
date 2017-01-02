(function() {
  'use strict';

  angular.module('app')
    .controller('SignupCtrl', [
      '$scope', '$auth', '$state', 'toastr',
      SignupCtrl
    ]);

  function SignupCtrl($scope, $auth, $state, toastr) {
    $scope.app.subtitle = 'Sign up';
    $scope.user = {};
    $scope.signup = function() {
      $auth.signup($scope.user, { ignoreAuthModule: true })
        .then(function(response) {
          /*toastr.clear();
          toastr.success('Signup Success！We will contact you as soon as possible！！！');*/
          $auth.setToken(response);
          $state.go('access.signupsuccess', {name: response.data.item.name});
        })
        .catch(function(response) {
          toastr.error(response.data.message, { timeOut: 7000, positionClass: 'toast-top-center' });
        });
    };
  }
})();
