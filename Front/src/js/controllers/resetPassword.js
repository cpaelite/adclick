(function () {
  'use strict';

  angular.module('app')
    .controller('ResetPasswordCtrl', [
      '$scope', '$auth', '$state', '$location', 'toastr', 'ResetPwd',
      ResetPasswordCtrl
    ]);

  function ResetPasswordCtrl($scope, $auth, $state, $location, toastr, ResetPwd) {
    $scope.app.subtitle = 'Sign up';
    
    $scope.resetPwd = function(){
      ResetPwd.get({'email':$scope.email},function(result){
        if(result.status){
          toastr.success('Please go to the mailbox to view!', {timeOut: 2000, positionClass: 'toast-top-center'});
        }
      });
    };
    $scope.goSignin = function() {
      $state.go('access.signin', {});
    };
  }

})();
