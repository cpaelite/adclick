(function () {
  'use strict';

  angular.module('app')
    .controller('ProfileCtrl', [
      '$scope', 'toastr', 'Profile', 'Password', 'Email', 'AccountCheck', 'Timezone',
      ProfileCtrl
    ]);

  function ProfileCtrl($scope, toastr, Profile, Password, Email, AccountCheck, Timezone) {
    $scope.app.subtitle = 'Setting';

    Timezone.get(null, function (timezone) {
      $scope.timezone = timezone.data.timezones;
    });

    Profile.get(null, function (user) {
      $scope.accountItem = user.data;
    });
    $scope.phoneNumbr = /^[0-9]*$/;
    $scope.accountSave = function () {
      delete $scope.accountItem.idText;
      delete $scope.accountItem.status;
      delete $scope.accountItem.referralToken;

      Profile.save($scope.accountItem, function () {
        toastr.success('Your account data save success!');
      });
    };

    $scope.passwordUpdateSave = function () {
      // 更改密码以后页面的输入框需要清空,如果页面验证就会直接显示错误信息,所以改为后台验证(帮助回忆的注释)
      if (!$scope.passwordItem || !$scope.passwordItem.oldpassword) {
        $scope.passwordForm.oldpassword.$setValidity('required', false);
        return;
      } else {
        $scope.passwordForm.oldpassword.$setValidity('required', true);
      }

      if (!$scope.passwordItem || !$scope.passwordItem.newpassword) {
        $scope.passwordForm.newpassword.$setValidity('required', false);
        return;
      } else {
        $scope.passwordForm.newpassword.$setValidity('required', true);
      }

      if (!$scope.passwordItem || !$scope.passwordItem.repeatNewPassword) {
        $scope.passwordForm.repeatNewPassword.$setValidity('required', false);
        return;
      } else {
        $scope.passwordForm.repeatNewPassword.$setValidity('required', true);
      }

      var passwrodItem = {
        oldpassword: $scope.passwordItem.oldpassword,
        newpassword: $scope.passwordItem.newpassword
      }
      Password.save(passwrodItem, function (result) {
        if (result.status) {
          toastr.success('Password reset success!');
        } else {
          toastr.error(result.message);
        }
        $scope.passwordItem = {}
      });
    };

    $scope.checkEmail = function () {
      function success(response) {
        if (response.data.exists) {
          $scope.emailForm.email.$setValidity('check', false);
        } else {
          $scope.emailForm.email.$setValidity('check', true);
        }
      }

      if ($scope.emailItem) {
        AccountCheck.save({email: $scope.emailItem.email}, success);
      }
    };

    $scope.emailUpdateSave = function () {
      Email.save($scope.emailItem, function (result) {
        if (result.status) {
          toastr.success('Email reset success!');
        } else {
          toastr.error(result.message);
        }

      });
    };
  }
})();
