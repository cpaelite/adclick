(function () {
    'use strict';

    angular.module('app')
        .controller('BotBlacklistCtrl', [
            '$scope','$mdDialog', 'BlackList',
            BotBlacklistCtrl
        ]);

    function BotBlacklistCtrl($scope,$mdDialog, BlackList) {
      this.titleType = "BotBlack";
      $scope.blacklistCount = 20;

      $scope.getList = function () {
        BlackList.get(null, function (blacklist) {
          $scope.items = blacklist.data.blacklist;
          $scope.status = blacklist.data.enabled;
        });
      };

      $scope.getList();

      $scope.$watch('status', function (newValue, oldValue) {
        if (!oldValue || angular.equals(newValue, oldValue)) {
          return;
        }
        var blackList = {
          enabled: newValue,
          blacklist: $scope.items
        };
        BlackList.save({date: blackList}, function (result) {
          console.log(result);
        });
      });

      $scope.editItem = function(ev, index) {
        $mdDialog.show({
          clickOutsideToClose: false,
          controller: ['$scope', '$mdDialog', 'BlackList', editItemCtrl],
          controllerAs: 'ctrl',
          focusOnOpen: false,
          locals: { index: index, items: $scope.items },
          bindToController: true,
          targetEvent: ev,
          templateUrl: 'tpl/botBlacklist-edit-dialog.html'
        });
        
      };

      $scope.deleteItem = function (ev, index) {
        delete $scope.items[index];
        var blackList = {
          enabled: newValue,
          blacklist: $scope.items
        };
        BlackList.save({date: blackList}, function (result) {
          console.log(result);
        });
      };

    }

  function editItemCtrl($scope, $mdDialog, BlackList) {
    if (this.items && this.index >= 0) {
      $scope.item = this.items[this.index];

      var ips = [];
      var ip = "";
      $scope.item.ipRules.forEach(function (ipRule) {
        if (ipRule.ipRangeStart == ipRule.ipRangeEnd) {
          ip = ipRule.ipRangeStart;
          ips.push({value: ip});
        } else {
          ip = ipRule.ipRangeStart + "-" + ipRule.ipRangeEnd;
          ips.push({value: ip});
        }
      });
      $scope.ips = ips;
    } else {
      $scope.item = {
        userAgentRules: [{}]
      };
      $scope.ips = [{}];
    }

    $scope.addIP = function () {
        $scope.ips.push({ value: "" })
    };

    $scope.deleteIP = function (index) {
      $scope.ips.splice(index, index);
    };

    $scope.addAgent = function () {
      $scope.item.userAgentRules.push({ value: "" })
    };

    $scope.deleteAgent = function (index) {
      $scope.item.userAgentRules.splice(index, index);
    };

    $scope.checkIP = function () {
      var isValid = true;
      // 验证IP格式
      var ipList = $scope.ipRange;
      if (ipList) {
        var re = /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
        var ips = ipList.split('-');
        ips.forEach(function (ip) {
          if (!re.test(ip)) {
            isValid = false;
            return;
          }
        });
        $scope.editForm.ipRange.$setValidity('valid', isValid);
      } else {
        $scope.editForm.ipRange.$setValidity('valid', isValid);
      }
    };

    this.cancel = $mdDialog.cancel;

    function success() {
      $mdDialog.hide();
    }

    this.save = function () {
      var ipRules = [];
      var ipRule;
      $scope.ips.forEach(function (ip) {
        var ips = ip.value.split('-');
        if (ips.length <= 1) {
          ipRule = {
            ipRangeStart: ips[0],
            ipRangeEnd: ips[0]
          };
        }
        if (ips.length >= 2) {
          ipRule = {
            ipRangeStart: ips[0],
            ipRangeEnd: ips[1]
          }
        }
        ipRules.push(ipRule);
      });

      $scope.item.ipRules = ipRules;
      if (this.index < 0) {
        this.items.push($scope.item);
      }

      $scope.editForm.$setSubmitted();
      if ($scope.editForm.$valid) {
        BlackList.save(this.items, success);
      }
    };
  }

})();
