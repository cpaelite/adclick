(function() {
  'use strict';

  angular.module('app')
    .controller('SignupSuccessCtrl', [
      '$scope', '$stateParams',
      SignupSuccessCtrl
    ]);

  function SignupSuccessCtrl($scope, $stateParams) {
    $scope.app.subtitle = 'Sign up Success';
    $scope.name = $stateParams.name;
  }
})();
