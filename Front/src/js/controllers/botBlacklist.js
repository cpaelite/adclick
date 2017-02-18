(function () {
  'use strict';

  angular.module('app')
    .controller('BotBlacklistCtrl', [
      '$scope', '$mdDialog', 'toastr', 'BlackList',
      BotBlacklistCtrl
    ]);

  function BotBlacklistCtrl($scope, $mdDialog, toastr, BlackList) {
    this.titleType = "BotBlack";
    $scope.blacklistCount = 20;

    $scope.getList = function () {
      BlackList.get(null, function (blacklist) {
        $scope.data = blacklist.data;
      });
    };

    $scope.getList();
    
    $scope.$watch('data.enabled', function (newValue, oldValue) {
      if ((newValue != undefined && oldValue == undefined) || newValue == oldValue) {
        return;
      }

      BlackList.save($scope.data, function (result) {
        if (result.status) {
          toastr.success('Update Success!');
        } else {
          toastr.error(result.message, {timeOut: 7000, positionClass: 'toast-top-center'});
        }
      });
    });

    $scope.editItem = function (ev, index) {
      $mdDialog.show({
        clickOutsideToClose: false,
        controller: ['$scope', '$mdDialog', 'toastr', 'BlackList', editItemCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {index: index, data: $scope.data},
        bindToController: true,
        targetEvent: ev,
        templateUrl: 'tpl/botBlacklist-edit-dialog.html'
      });

    };

    $scope.deleteItem = function (ev, index) {
      $mdDialog.show({
        clickOutsideToClose: true,
        controller: ['$scope', '$mdDialog', 'toastr', 'BlackList', deleteCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        targetEvent: ev,
        locals: {index: index, data: $scope.data},
        bindToController: true,
        templateUrl: 'tpl/delete-confirm-dialog.html'
      });
    };

  }

  function editItemCtrl($scope, $mdDialog, toastr, BlackList) {
    if (this.data.blacklist && this.index >= 0) {
      $scope.item = this.data.blacklist[this.index];
    } else {
      $scope.item = {
        ipRules:[""],
        userAgentRules: [""]
      };
    }

    $scope.addIP = function () {
      $scope.item.ipRules.push("");
    };

    $scope.deleteIP = function (index) {
      $scope.item.ipRules.splice(index, index);
    };

    $scope.addAgent = function () {
      $scope.item.userAgentRules.push("")
    };

    $scope.deleteAgent = function (index) {
      $scope.item.userAgentRules.splice(index, index);
    };

    $scope.checkIP = function (index) {
      var isValid = true;
      // 验证IP格式
      var ipList = $scope.item.ipRules[index];
      if (ipList) {
        var re = /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
        var ips = ipList.split('-');
        ips.forEach(function (ip) {
          if (!re.test(ip)) {
            isValid = false;
            return;
          }
        });
        var temp = 'ipRange' + index;
        $scope.editForm[temp].$setValidity('valid', isValid);
      } else {
        $scope.editForm.ipRange.$setValidity('valid', isValid);
      }
    };

    this.cancel = $mdDialog.cancel;

    function success(result) {
      if (result.status) {
        toastr.success('Update Success!');
      } else {
        toastr.error(result.message, {timeOut: 7000, positionClass: 'toast-top-center'});
      }
      $mdDialog.hide();
    }

    this.save = function () {
      if (this.index < 0) {
        this.data.blacklist.push($scope.item);
      }

      $scope.editForm.$setSubmitted();
      if ($scope.editForm.$valid) {
        BlackList.save(this.data, success);
      }
    };
  }

  function deleteCtrl($scope, $mdDialog, toastr, BlackList) {
    this.title = "delete";
    this.content = 'warnDelete';

    this.cancel = $mdDialog.cancel;

    this.ok = function () {
      this.data.blacklist.splice(this.index, this.index);
      BlackList.save(this.data, success, error);
    };

    function success() {
      toastr.success("success delete");
      $mdDialog.hide();
    }

    function error() {
      this.error = 'Error occured when delete.';
    }
  }

})();
