(function () {
  'use strict';

  angular.module('app')
    .controller('ResetPasswordInfoCtrl', [
      '$scope', '$state', '$location', 'toastr', 'ResetPwd',
      ResetPasswordInfoCtrl
    ]);

  function ResetPasswordInfoCtrl($scope, $state, $location, toastr, ResetPwd) {
    $scope.app.subtitle = 'Sign up';

    var code = $location.$$search.code;
    $scope.resetPwd = function(){
      ResetPwd.save({'newpassword':$scope.user,'code':code},function(result){
        if(result.status){
          toastr.success('Password reset success!', {timeOut: 2000, positionClass: 'toast-top-center'});
          $state.go('access.signin',{});
        }
      });
    };

    $scope.goSignin = function() {
      $state.go('access.signin', {});
    };
  }

})();
