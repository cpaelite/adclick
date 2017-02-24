(function () {
  'use strict';

  angular.module('app')
    .controller('BotBlacklistCtrl', [
      '$scope', '$mdDialog', 'toastr', 'BlackList',
      BotBlacklistCtrl
    ]);

  function BotBlacklistCtrl($scope, $mdDialog, toastr, BlackList) {
    $scope.app.subtitle = "BotBlack";
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
      }).then(function (result) {
        if (result) {
          $scope.data.blacklist.splice(index, index);
        }
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

    $scope.regex = "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(-(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))?$";

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
      BlackList.save(this.data, success);
    };

    function success(response) {
      if (response.status) {
        toastr.success("success delete");
        $mdDialog.hide(true);
      } else {
        toastr.error(response.message);
        $mdDialog.hide(false);
      }
    }
  }

})();
