(function () {
  'use strict';

  angular.module('app')
    .controller('ResetPasswordInfoCtrl', [
      '$scope', '$auth', '$state', '$location', 'toastr', 'ResetPwd',
      ResetPasswordInfoCtrl
    ]);

  function ResetPasswordInfoCtrl($scope, $auth, $state, $location, toastr, ResetPwd) {
    $scope.app.subtitle = 'Sign up';
    // console.log($scope.$stateParams.t);
    // var refToken = $location.$$search.refToken;
    // if (refToken) {
    //   $scope.user = {
    //     refToken: refToken
    //   };
    // } else {
    //   $scope.user = {};
    // }


    // $scope.checkEmail = function () {
    //   function success(response) {
    //     if (response.data.exists) {
    //       $scope.form.email.$setValidity('check', false);
    //     } else {
    //       $scope.form.email.$setValidity('check', true);
    //     }
    //   }

    //   if ($scope.user && $scope.user.email) {
    //     AccountCheck.save({email: $scope.user.email}, success);
    //   }
    // };

    $scope.resetPwd = function(){
      ResetPwd.save($scope.user,function(result){
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
