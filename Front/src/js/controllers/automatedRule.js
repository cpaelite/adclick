(function () {
  'use strict';

  angular.module('app')
    .controller('AutomatedRuleCtrl', [
      '$scope', '$timeout', '$mdDialog', 'toastr', 'Campaign',  AutomatedRuleCtrl
    ]);

  function AutomatedRuleCtrl($scope, $timeout, $mdDialog, toastr, Campaign) {

    $scope.app.subtitle = "SuddenChange";

    $scope.editItem = function(item) {
      $mdDialog.show({
        clickOutsideToClose: true,
        escapeToClose: false,
        controller: ['$scope', '$mdDialog', 'AutomatedRuleOptions', 'AutomatedRule', editRuleCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {item: item},
        templateUrl: 'tpl/automatedRule-edit-dialog.html?' + +new Date()
      }).then(function() {

      });
    }

    function editRuleCtrl($scope, $mdDialog, AutomatedRuleOptions, AutomatedRule) {
      if (this.item) {
        this.title = "edit";
        $scope.campaigns = this.item.campaigns;
        AutomatedRule.get({id: this.item.id}, function(result) {
          $scope.item = result.data;
        });
      } else {
        this.title = "add";
        $scope.conditionArray = [
          {
            "key": "sumImps",
            "operand": ">",
            "value": ""
          }
        ];
        $scope.item = {
          "dimension": "WebSiteId",
          "timeSpan": "last3hours",
          "then": "1",
          "frequency": "Every 1 Hour",
          "executionType": "0"
        };
      }
      this.titleType = "Rule";

      $scope.dimensions = AutomatedRuleOptions.dimension;
      $scope.dataFroms = AutomatedRuleOptions.dataFrom;
      $scope.conditions = AutomatedRuleOptions.condition;
      $scope.frequencys = AutomatedRuleOptions.frequency;

      $scope.hours = [];
      for (var i=0; i<24; ++i) {
        if (i < 10) {
          $scope.hours.push('0' + i + ':00');
        } else {
          $scope.hours.push('' + i + ':00');
        }
      }

      $scope.conditionDisable = function(item, index) {
        var selectConditions = $scope.conditionArray.map(function(con) {
          return con.key;
        });
        var selectIdx = selectConditions.indexOf(item.key);
        return selectIdx > -1 && selectIdx != index;
      }

      $scope.campaignFilter = {
        config: {
            plugins: ['remove_button'],
            valueField: 'id',
            labelField: 'name',
            searchField: ['name']
        },
        options: []
      };

      $scope.addCondition = function() {
        var key;
        var selectConditions = $scope.conditionArray.map(function(con) {
          return con.key;
        });
        var isBreak = false;
        $scope.conditions.forEach(function(con) {
            if (selectConditions.indexOf(con.key) < 0 && !isBreak) {
              key = con.key;
              isBreak = true;
            }
        });
        $scope.conditionArray.push({
          "key": key,
          "operand": "0",
          "value": ""
        });
      };

      $scope.deleteCondition = function(condition) {
        var idx = $scope.conditionArray.indexOf(condition);
        if (idx >= 0) {
          $scope.conditionArray.splice(idx, 1);
        }
      };

      Campaign.get(null, function(result) {
        if (result.status) {
          $scope.campaignFilter.options = result.data.campaign;
        }
      });

      this.save = function() {
        $scope.editForm.$setSubmitted();
        if ($scope.editForm.$valid) {
          $scope.saveStatus = true;
          $scope.item.conditions = $scope.conditionArray;
          AutomatedRule.save($scope.item, success);
        }
      }

      function success(item) {
        $scope.saveStatus = false;
        if(item.data.status == 0) {
          $scope.errMessage = item.message;
          return;
        } else {
          $mdDialog.hide();
        }
      }

      this.cancel = $mdDialog.cancel;
    }
    
  }
})();
