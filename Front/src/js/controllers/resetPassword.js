(function () {
  'use strict';

  angular.module('app')
    .controller('ResetPasswordCtrl', [
      '$scope', '$auth', '$state', '$location', 'toastr', 'ForgotPwd',
      ResetPasswordCtrl
    ]);

  function ResetPasswordCtrl($scope, $auth, $state, $location, toastr, ForgotPwd) {
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
      ForgotPwd.save(null,function(result){
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
