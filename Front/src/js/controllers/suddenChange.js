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
    // $scope.trs = [
    //   {
    //     name:'exclude',
    //     campaigns:'AvazuMdsp - Thailand - Cool Clip-mmatch-sj',
    //     action:'Exclude Inventory Apps/Sites',
    //     frequerncy:'Every 6 Hours',
    //     datafrom:'Last 6 Hours'
    //   },
    //   {
    //     name:'exclude',
    //     campaigns:'AvazuMdsp - Thailand - Cool Clip-mmatch-sj',
    //     action:'Exclude Inventory Apps/Sites',
    //     frequerncy:'Every 6 Hours',
    //     datafrom:'Last 6 Hours'
    //   }
    // ];
    // $scope.logs = [
    //   {
    //     time:'2017-04-19 06:01:01',
    //     name:'exclude sites'
    //   },
    //   {
    //     time:'2017-04-19 07:01:01',
    //     name:'exclude sites'
    //   }
    // ];

    $scope.viewLogs = function(tr){
      console.log(tr);
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
        controller: ['$scope', '$mdDialog', 'toastr', 'BlackList', '$timeout', editItemCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {index: index, data: $scope.data},
        bindToController: true,
        targetEvent: ev,
        templateUrl: 'tpl/botBlacklist-edit-dialog.html?' + +new Date()
      });

    };

    $scope.deleteItem = function (ev, index) {
      $mdDialog.show({
        clickOutsideToClose: true,
        controller: ['$scope', '$mdDialog', 'toastr', 'BlackList', '$timeout', deleteCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        targetEvent: ev,
        locals: {index: index, data: $scope.data},
        bindToController: true,
        templateUrl: 'tpl/delete-confirm-dialog.html?' + +new Date()
      }).then(function (result) {
        if (result) {
          $scope.data.blacklist.splice(index, index);
        }
      });
    };

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

  function editItemCtrl($scope, $mdDialog, toastr, BlackList, $timeout) {
    var re = /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;

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
      $timeout(function() {
        $scope.blurInput();
      });
    };

    $scope.deleteIP = function (index) {
      $scope.item.ipRules.splice(index, index);
      $scope.blurInput();
    };

    $scope.addAgent = function () {
      $scope.item.userAgentRules.push("");
      $timeout(function() {
        $scope.blurInput();
      });
    };

    $scope.deleteAgent = function (index) {
      $scope.item.userAgentRules.splice(index, index);
      $scope.blurInput();
    };

    $scope.checkIP = function (index) {
      var isValid = true;
      // 验证IP格式
      var ipList = $scope.item.ipRules[index];
      if (ipList) {
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

    $scope.blurInput = function() {
      var index;
      var ipReg = $scope.item.ipRules.some(function(v, i) {
        index = i;
        return v && !re.test(v);
      });
      var ipRequired = $scope.item.ipRules.some(function(v, i) {
        return v && v.length > 0;
      });
      var userAgentRequired = $scope.item.userAgentRules.some(function(v, i) {
        return v && v.length > 0;
      });
      // reset
      $scope.item.ipRules.forEach(function(v, i) {
        $scope.editForm['ipRule' + i].$setValidity('valid', true);
      });
      $scope.item.ipRules.forEach(function(v, i) {
        $scope.editForm['ipRule' + i].$setValidity('required', true);
      });
      $scope.item.userAgentRules.forEach(function(v, i) {
        $scope.editForm['userAgentRule' + i].$setValidity('required', true);
      });

      if (!ipRequired && !userAgentRequired) {
        $scope.item.ipRules.forEach(function(v, i) {
          $scope.editForm['ipRule' + i].$setValidity('required', false);
        });
        $scope.item.userAgentRules.forEach(function(v, i) {
          $scope.editForm['userAgentRule' + i].$setValidity('required', false);
        });
      } else {
        if(ipReg) {
          $scope.editForm['ipRule' + index].$setValidity('valid', false);
        }
      }
    };

    this.cancel = $mdDialog.cancel;

    function success(result) {
      $scope.blackListStatus = false;
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
      $scope.blurInput();
      if ($scope.editForm.$valid) {
        $scope.blackListStatus = true;
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
