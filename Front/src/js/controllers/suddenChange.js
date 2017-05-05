(function () {
  'use strict';

  angular.module('app')
    .controller('suddenChangeCtrl', [
      '$scope', '$mdDialog', 'toastr','SuddenChange', 'Logs', 'LogDetail', 'DateRangeUtil', 'LocalStorageUtil', 'BlackList', '$timeout',
      suddenChangeCtrl
    ]);

  function suddenChangeCtrl($scope,  $mdDialog, toastr, SuddenChange, Logs, LogDetail, DateRangeUtil, LocalStorageUtil, BlackList, $timeout) {
    $scope.app.subtitle = 'Sudden Change';

    $scope.ths = [
      {name:'Rule Name'},
      {name:'Dimension'},
      {name:'TimeSpan'}
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
      status: 2,
      filter:'',
      page: 1,
      limit: 1000
    };

    // 账户类型对rule的数量的限制
    $scope.ruleLimit = $scope.permissions.report.suddenchange.scRuleLimit;

    $scope.tabSelected = 0;
    $scope.getRuleList = function(){
      var params = angular.copy($scope.query);
      if (!params.filter) {
        delete params.filter;
      }
      SuddenChange.get(params,function(result){
        $scope.list = result.data;
      });
    };
    $scope.getRuleList();

    $scope.datetype = LocalStorageUtil.getValue().datetype;
    var fromTime = LocalStorageUtil.getValue().fromTime;
    var toTime = LocalStorageUtil.getValue().toTime;
    $scope.queryLog = {
      filter:'',
      page: 1,
      limit: 1000,
      from: LocalStorageUtil.getValue().fromDate,
      to: LocalStorageUtil.getValue().toDate
    };

    $scope.filter = {
      fromDate: LocalStorageUtil.getValue().fromDate,
      toDate: LocalStorageUtil.getValue().toDate
    };
    // 如果不是自定义时间，重新计算时间
    if ($scope.datetype != "0") {
      getDateRange($scope.datetype);
    }

    $scope.getLogList = function(){
      var params = angular.copy($scope.queryLog);
      if(!params.filter) {
        delete params.filter;
      }
      Logs.get(params, function(result){
        $scope.loglist = result.data;
      });
    };
    $scope.getLogList();

    $scope.$watch('filter', function (newValue, oldValue) {
      if (angular.equals(newValue, oldValue)) {
        return;
      }
      $scope.queryLog.from = moment($scope.filter.fromDate).format('YYYY-MM-DD');
      $scope.queryLog.to = moment($scope.filter.toDate).format('YYYY-MM-DD');
      LocalStorageUtil.setValue($scope.datetype, $scope.queryLog.from, fromTime, $scope.queryLog.to, toTime);
      $scope.getLogList();

    }, true);

    function getDateRange(value) {
      var from = DateRangeUtil.fromDate(value, '+00:00');
      var to = DateRangeUtil.toDate(value, '+00:00');
      $scope.queryLog.from = from;
      $scope.queryLog.to = to;
      // 自定义时间类型时，时间控件默认Today的时间
      if (value == "0") {
        $scope.filter.fromDate = from;
        $scope.filter.toDate = to;
      } else {
        fromTime = "00:00";
        toTime = "00:00";
      }
      LocalStorageUtil.setValue(value, $scope.queryLog.from, fromTime, $scope.queryLog.to, toTime);
    }

    $scope.statusChange = function(){
      $scope.getRuleList();
    };
    $scope.logQueryChange = function(){
      getDateRange($scope.datetype);
      // 自定义时间类型时，根据时间控件时间变化而请求数据
      if ($scope.datetype != "0") {
        $scope.getLogList();
      }
    };

    $scope.blacklistCount = 20;

    $scope.getBlackList = function () {
      BlackList.get(null, function (blacklist) {
        $scope.data = blacklist.data;
      });
    };

    $scope.getBlackList();

    $scope.editRuleItem = function(item) {
      $mdDialog.show({
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: ['$scope', '$mdDialog', "$q", 'AutomatedRuleOptions', 'Campaign', 'AutomatedRule', 'EmailValidate', editRuleCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {item: item},
        templateUrl: 'tpl/automatedRule-edit-dialog.html?' + +new Date()
      }).then(function(id) {
        if(!id) {
          $scope.query.status = 2;
        }
        if($scope.tabSelected != 0) {
          $scope.tabSelected = 0;
        }
        $scope.getRuleList();
      });
    }

    $scope.deleteRuleItem = function(id){
      $mdDialog.show({
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: ['$scope', '$mdDialog', 'SuddenChange', deleteRuleCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {id: id},
        bindToController: true,
        templateUrl: 'tpl/delete-rule-dialog.html?' + +new Date()
      }).then(function() {
        $scope.getRuleList();
      });
    };

    var ruleUpdateStatus = false;
    $scope.ruleStatusChange = function(index){
      if (!ruleUpdateStatus) {
        ruleUpdateStatus = true;
        var rule = $scope.list.rules[index];
        if(rule.status == 0){
          rule.status = 1;
        }else{
          rule.status = 0;
        }
        SuddenChange.save(rule, function(oData) {
          if(oData.status == 1) {
            ruleUpdateStatus = false;
            $scope.getRuleList();
          }
        });
      }

    };
  }

  function editRuleCtrl($scope, $mdDialog, $q, AutomatedRuleOptions, Campaign, AutomatedRule, EmailValidate) {
    // init load data
    var initPromises = [], prms;
      if (this.item) {
        this.title = "edit";
        var theData;
        prms = AutomatedRule.get({id: this.item.id}, function(result) {
          theData = result.data;
        }).$promise;
        initPromises.push(prms);
      } else {
        this.title = "add";
        $scope.conditionArray = [
          {
            "key": "sumImpressions",
            "operand": ">",
            "value": ""
          }
        ];
        $scope.item = {
          "dimension": "tsWebsiteId",
          "timeSpan": "last3hours",
        };
      }
      var date = moment().utcOffset("+00:00").format('YYYY-MM-DD');
      var time = moment().utcOffset("+00:00").format('H');
      $scope.dateOptions = {
        minDate: date
      }

      $scope.frequency = "Every 1 Hour";
      $scope.freDate = date;
      $scope.freWeek = "0";
      $scope.freTime = "0";

      this.titleType = "Rule";

      $scope.dimensions = AutomatedRuleOptions.dimension;
      $scope.timeSpans = AutomatedRuleOptions.timeSpan;
      $scope.conditions = AutomatedRuleOptions.condition;
      $scope.frequencys = AutomatedRuleOptions.frequency;

      var conditionMap = {};
      $scope.conditions.forEach(function(con) {
        conditionMap[con.key] = con.unit;
      })
      $scope.conditionMap = conditionMap;

      $scope.hours = [];
      for (var i=0; i<24; ++i) {
        if (i < 10) {
          $scope.hours.push({key: i.toString(), display: '0' + i + ':00'});
        } else {
          $scope.hours.push({key: i.toString(), display: i + ':00'});
        }
      }

      $scope.dateChange = function() {
        if (moment(date).isAfter(moment($scope.freDate).format('YYYY-MM-DD'))) {
          $scope.freTime = "";
        }
      }

      $scope.hourDisabled = function(hour) {
        // 选择One Time 并且是当天日期，小于当前的时间不能选
        return ($scope.frequency == "One Time"
              && moment(date).isSame(moment($scope.freDate).format('YYYY-MM-DD'))
              && parseInt(hour) <= parseInt(time))
              || moment(date).isAfter(moment($scope.freDate).format('YYYY-MM-DD'));
      };
      $scope.weeks = [
        {key: "0", display: "Sunday"},
        {key: "1", display: "Monday"},
        {key: "2", display: "Tuesday"},
        {key: "3", display: "Wednesday"},
        {key: "4", display: "Thursday"},
        {key: "5", display: "Friday"},
        {key: "6", display: "Saturday"},
      ];

      $scope.campaignFilter = {
        config: {
            plugins: ['remove_button'],
            valueField: 'id',
            labelField: 'name',
            searchField: ['name']
        },
        options: []
      };

      // 获取所有campaign
      prms = Campaign.get(null, function(result) {
        if (result.status) {
          $scope.campaignFilter.options = result.data;
        }
      }).$promise;
      initPromises.push(prms);

      function initSuccess() {
        if (theData) {
          $scope.item = theData;
          $scope.item.campaigns = $scope.item.campaigns.split(",");
          $scope.conditionArray = fillConditionArray($scope.item.condition);
          parseScheduleString($scope);
          // 是否显示日期选择框
          $scope.showDateSelect = function() {
            return ['One Time'].indexOf($scope.frequency) >= 0;
          };
          // 是否显示星期选择框
          $scope.showWeekSelect = function() {
            return ['Weekly'].indexOf($scope.frequency) >= 0;
          };
          // 是否显示时间选择框
          $scope.showTimeSelect = function() {
            return ['Daily', 'Weekly', 'One Time'].indexOf($scope.frequency) >= 0;
          };
        }
      }

      $q.all(initPromises).then(initSuccess);

      $scope.conditionDisable = function(item, index) {
        var selectConditions = $scope.conditionArray.map(function(con) {
          return con.key;
        });
        var selectIdx = selectConditions.indexOf(item.key);
        return selectIdx > -1 && selectIdx != index;
      }

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
          "operand": ">",
          "value": ""
        });
      };

      $scope.deleteCondition = function(condition) {
        var idx = $scope.conditionArray.indexOf(condition);
        if (idx >= 0) {
          $scope.conditionArray.splice(idx, 1);
        }
      };

      $scope.validateEmail = function() {
        var isValid = EmailValidate.validate($scope.item.emails);
        $scope.editForm.email.$setValidity('emailValid', isValid);
      }

      this.save = function() {
        $scope.editForm.$setSubmitted();
        if ($scope.editForm.$valid) {
          // crontab格式处理, 0(秒) 0(分) *(时) *(天) *(月) *(星期)
          formateCrontab($scope);
          // condition
          var condition = "";
          $scope.conditionArray.forEach(function(con) {
            condition = condition +  con.key + con.operand + con.value + ",";
          });
          $scope.item.condition = condition;
          var params = angular.copy($scope.item);
          params.campaigns = params.campaigns.join(',')
          $scope.saveStatus = true;
          AutomatedRule.save(params, success);
        }
      }

      function success(item) {
        $scope.saveStatus = false;
        if(item.status == 0) {
          $scope.errMessage = item.message;
          return;
        } else {
          $mdDialog.hide($scope.item.id);
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

  // 根据condition字符串获取数组
  function fillConditionArray(conStr) {
    var conditions = conStr.split(",");
    var conditionArray = [];
    conditions.forEach(function(con) {
      var newCon;
      if (con.indexOf(">") > 0) {
        newCon = {
          "key": con.substring(0, con.indexOf(">")),
          "operand": ">",
          "value": Number(con.substring(con.indexOf(">")+1))
        }
      } else if (con.indexOf("<") > 0) {
        newCon = {
          "key": con.substring(0, con.indexOf("<")),
          "operand": "<",
          "value": Number(con.substring(con.indexOf("<")+1))
        }
      }
      if (newCon) {
        conditionArray.push(newCon);
      }
    });
    return conditionArray;
  }

  // crontab格式处理, 0(秒) 0(分) *(时) *(天) *(月) *(星期)
  function formateCrontab($scope) {
    if ($scope.frequency == "Daily") {
      $scope.item.schedule = "0 0 " + $scope.freTime + " * * *";
      $scope.item.scheduleString = $scope.frequency + " " + $scope.freTime;
    } else if ($scope.frequency == "Weekly") {
      $scope.item.schedule = "0 0 " + $scope.freTime + " * * " + $scope.freWeek;
      $scope.item.scheduleString = $scope.frequency + " " + $scope.freWeek + " " + $scope.freTime;
    } else if ($scope.frequency == "One Time") {
      var freDate = moment($scope.freDate).format('YYYY-MM-DD');
      var dateSplit = freDate.split("-");
      var month = dateSplit[1];
      var daily = dateSplit[2];
      if (month.indexOf(0) == 0) {
        month = month.substring(1);
      }
      if (daily.indexOf(0) == 0) {
        daily = daily.substring(1);
      }
      $scope.item.schedule = "0 0 " + $scope.freTime + " " + daily + " " + month + " *";
      $scope.item.scheduleString = $scope.frequency + " " + freDate + " " + $scope.freTime;
      $scope.item.oneTime = freDate + "T" + $scope.freTime;
    } else {
      var time = $scope.frequency.split(" ")[1];
      $scope.item.schedule = "0 0 */" + time + " * * *";
      $scope.item.scheduleString = $scope.frequency;
    }
  }

  // 处理scheduleString
  function parseScheduleString($scope) {
    var schStr = $scope.item.scheduleString.split(" ");
    if ($scope.item.scheduleString.indexOf("Daily") != -1) {
      $scope.frequency = schStr[0];
      $scope.freDate = new Date();
      $scope.freWeek = "0";
      $scope.freTime = schStr[1];
    } else if ($scope.item.scheduleString.indexOf("Weekly") != -1) {
      $scope.frequency = schStr[0];
      $scope.freDate = new Date();
      $scope.freWeek = schStr[1];
      $scope.freTime = schStr[2];
    } else if ($scope.item.scheduleString.indexOf("One Time") != -1) {
      $scope.frequency = "One Time";
      $scope.freDate = new Date(schStr[2]);
      $scope.freWeek = "0";
      $scope.freTime = schStr[3];
    } else if ($scope.item.scheduleString.indexOf("Every") != -1) {
      $scope.frequency = $scope.item.scheduleString;
      $scope.freDate = new Date();
      $scope.freWeek = "0";
      $scope.freTime = "0";
    }

  }


})();
