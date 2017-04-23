(function () {
  'use strict';

  angular.module('app')
    .controller('suddenChangeCtrl', [
      '$scope', '$mdDialog', 'toastr','SuddenChange', 'Logs', 'LogDetail', 'DateRangeUtil', 'BlackList', '$timeout',
      suddenChangeCtrl
    ]);

  function suddenChangeCtrl($scope,  $mdDialog, toastr, SuddenChange, Logs, LogDetail, DateRangeUtil, BlackList, $timeout) {
    $scope.app.subtitle = 'Sudden Change';

    $scope.ths = [
      {name:'Rule Name'},
      {name:'Campaigns'},
      {name:'Automatic Action'},
      {name:'Frequerncy'},
      {name:'Using data from'}
    ];

    $scope.viewLogs = function(tr){
      $mdDialog.show({
        clickOutsideToClose: false,
        controller: ['$scope', '$mdDialog', 'LogDetail', ruleLogCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {data:tr},
        bindToController: true,
        templateUrl: 'tpl/rule-log-dialog.html?' + +new Date()
      });
    };

    $scope.query = {
      activeStatus :'1',
      searchFilter:''
    };
    $scope.getRuleList = function(){
      SuddenChange.get($scope.query,function(result){
        $scope.list = result.data;
      });
    };
    $scope.getRuleList();

    $scope.datetype = '1';
    $scope.queryLog = {
      searchFilter:''
    };
    $scope.getLogList = function(){
      Logs.get($scope.queryLog,function(result){
        $scope.loglist = result.data;
      });
    };
    $scope.getLogList();

    getDateRange($scope.datetype);

    function getDateRange(value) {
      var fromDate = DateRangeUtil.fromDate(value);
      var toDate = DateRangeUtil.toDate(value);
      if (value == '0') {
        $scope.queryLog.from = moment().format('YYYY-MM-DD');
        $scope.queryLog.to = moment().add(1, 'days').format('YYYY-MM-DD');
      } else {
        $scope.queryLog.from = fromDate;
        $scope.queryLog.to = toDate;
      }
    }

    $scope.statusChange = function(){
      $scope.getRuleList();
    };
    $scope.logQueryChange = function(){
      getDateRange($scope.datetype);
      $scope.getLogList();
    };

    $scope.editRuleItem = function(item) {
      $mdDialog.show({
        clickOutsideToClose: true,
        escapeToClose: false,
        controller: ['$scope', '$mdDialog', 'AutomatedRuleOptions', 'Campaign', 'AutomatedRule', editRuleCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {item: item},
        templateUrl: 'tpl/automatedRule-edit-dialog.html?' + +new Date()
      }).then(function() {
        $scope.getList();
      });
    }

    $scope.deleteRule = function(id){
      $mdDialog.show({
        clickOutsideToClose: true,
        escapeToClose: false,
        controller: ['$scope', '$mdDialog', 'SuddenChange', deleteRuleCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {id: id},
        bindToController: true,
        templateUrl: 'tpl/delete-rule-dialog.html?' + +new Date()
      });
    };

    $scope.ruleStatusChange = function(index){
      if($scope.list.rules[index].status == 0){
        $scope.list.rules[index].status = 1;
      }else{
        $scope.list.rules[index].status = 0;
      }
      SuddenChange.save($scope.list.rules[index]);
    };
  }

  function editRuleCtrl($scope, $mdDialog, AutomatedRuleOptions, Campaign, AutomatedRule) {
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
        $scope.freDate = moment().format('YYYY-MM-DD');;
        $scope.freWeek = "0";
        $scope.freTime = "00:00";

      }
      this.titleType = "Rule";

      $scope.dimensions = AutomatedRuleOptions.dimension;
      $scope.timeSpans = AutomatedRuleOptions.timeSpan;
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
      $scope.weeks = [
        {"key": 0, display: "Sunday"},
        {"key": 1, display: "Monday"},
        {"key": 2, display: "Tuesday"},
        {"key": 3, display: "Wednesday"},
        {"key": 4, display: "Thursday"},
        {"key": 5, display: "Friday"},
        {"key": 6, display: "Saturday"},
      ];

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

      // 是否显示日期选择框
      $scope.showDateSelect = function() {
        return ['One Time'].indexOf($scope.item.frequency) >= 0;
      };
      // 是否显示星期选择框
      $scope.showWeekSelect = function() {
        return ['Weekly'].indexOf($scope.item.frequency) >= 0;
      };
      // 是否显示时间选择框
      $scope.showTimeSelect = function() {
        return ['Daily', 'Weekly', 'One Time'].indexOf($scope.item.frequency) >= 0;
      };

      // 获取所有campaign
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
        if(item.status == 0) {
          $scope.errMessage = item.message;
          return;
        } else {
          $mdDialog.hide();
        }
      }

      this.cancel = $mdDialog.cancel;
    }

  function ruleLogCtrl($scope, $mdDialog, LogDetail){
    this.cancel = $mdDialog.cancel;
    LogDetail.get({id:this.data.id},function(result){
      $scope.detailItem = result.data;
    });
    $scope.rule = {
      name:  this.data.name,
      dimension: this.data.dimension
    };
  }

  function deleteRuleCtrl($scope, $mdDialog, SuddenChange){
    this.cancel = $mdDialog.cancel;
    this.title = 'confirm delete';
    this.content = 'are you sure you want to delete this rule';

    this.ok = function(){
      SuddenChange.remove({'id': this.id},function(){
        $mdDialog.hide();
      });
    };
  }

})();
