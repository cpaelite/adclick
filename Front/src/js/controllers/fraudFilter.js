(function () {
  'use strict';

  angular.module('app')
    .controller('fraudFilterCtrl', [
      '$scope', '$mdDialog', '$q', 'FraudFilter', 'Campaign',
      FraudFilterCtrl
    ]);

  function FraudFilterCtrl($scope,  $mdDialog, $q, FraudFilter, Campaign) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$q = $q;
    this.FraudFilter = FraudFilter;
    this.Campaign = Campaign;

    this.campaigns = [];
    this.campaignMap = {};
    this.$scope.query = {
      page: 1,
      limit: 50,
      status: 0,
      filter: '',
      __tk: 0
    };

    this.init();
    this.initEvent();
  }

  FraudFilterCtrl.prototype.init = function() {
    var self = this, $scope = self.$scope, initPromises = [];

    $scope.app.subtitle = 'Fraud Filter';
    initPromises.push(self._getFraudFilters());
    initPromises.push(self._getCampaigns());
    self.$q.all(initPromises).then(initSuccess);

    function initSuccess() {
      self.campaigns.forEach(function(campaign) {
        self.campaignMap[campaign.id] = campaign;
      });
      $scope.rules.rules.map(function(rule) {
        var campaignIds = rule.campaigns.split(',');
        var campaignNameArr = [];

        campaignIds.forEach(function(id) {
          campaignNameArr.push(self.campaignMap[id].name);
        });
        rule.campaignNames = campaignNameArr.join(',');
      });
    }

    $scope.$watch('query', function (newVal, oldVal) {
      if (angular.equals(newVal, oldVal)) {
        return;
      }
      if (oldVal && (newVal.order != oldVal.order || newVal.limit != oldVal.limit || newVal.filter != oldVal.filter || newVal.status != oldVal.status) && newVal.page > 1) {
        $scope.query.page = 1;
      }

      self._getFraudFilters();
    }, true);
  };

  FraudFilterCtrl.prototype.initEvent = function() {
    var self = this, $scope = self.$scope, FraudFilter = self.FraudFilter;

    $scope.ruleStatusChange = function(rule) {
      var rule = angular.copy(rule);
      if (rule.status == 0) {
        rule.status = 1;
      } else {
        rule.status = 0;
      }
      FraudFilter.update({id: rule.id}, rule, function(oData) {
        console.log(oData);
      });
    };

    $scope.editRuleItem = function(rule) {

    };

    $scope.deleteRule = function(id) {
      self.$mdDialog.show({
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: ['$scope', '$mdDialog', 'FraudFilter', DeleteRuleCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {id: id},
        bindToController: true,
        templateUrl: 'tpl/delete-rule-dialog.html?' + +new Date()
      }).then(function() {
        self.$scope.query.__tk++;
      });
    };
  };

  FraudFilterCtrl.prototype._getFraudFilters = function() {
    var self = this, $scope = self.$scope, FraudFilter = self.FraudFilter;
    var params = angular.copy($scope.query);
    delete params.__tk;
    return FraudFilter.get(params, function(oData) {
      $scope.rules = oData.data;
    }).$promise;
  };

  FraudFilterCtrl.prototype._getCampaigns = function() {
    var self = this, $scope = self.$scope, Campaign = self.Campaign;
    return Campaign.get(null, function(oData) {
      self.campaigns = oData.data.campaign;
    }).$promise;
  };


  function DeleteRuleCtrl($scope, $mdDialog, FraudFilter) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.FraudFilter = FraudFilter;

    this.init();
  }

  DeleteRuleCtrl.prototype.init = function() {
    var self = this, FraudFilter = self.FraudFilter, $mdDialog = self.$mdDialog;

    this.cancel = $mdDialog.cancel;
    this.title = 'confirm delete';
    this.content = 'are you sure you want to delete this rule';

    this.ok = function(){
      FraudFilter.remove({id: self.id}, function(oData) {
        if(oData.status == 1) {
          $mdDialog.hide();
        }
      });
    };
  };






  // $scope.viewLogs = function(ev){
  //   $mdDialog.show({
  //     clickOutsideToClose: false,
  //     controller: ['$scope', '$mdDialog', ruleLogCtrl],
  //     controllerAs: 'ctrl',
  //     focusOnOpen: false,
  //     // locals: {index: index, data: $scope.data},
  //     bindToController: true,
  //     targetEvent: ev,
  //     templateUrl: 'tpl/rule-log-dialog.html?' + +new Date()
  //   });
  // };
  //
  // function ruleLogCtrl($scope, $mdDialog){
  //   this.cancel = $mdDialog.cancel;
  // }
  //
  // $scope.editRuleItem = function(item) {
  //   $mdDialog.show({
  //     clickOutsideToClose: true,
  //     escapeToClose: false,
  //     controller: ['$scope', '$mdDialog', 'FraudFilterRuleOptions', editRuleCtrl],
  //     controllerAs: 'ctrl',
  //     focusOnOpen: false,
  //     bindToController: true,
  //     locals: {item: item},
  //     templateUrl: 'tpl/fraudFilter-edit-dialog.html?' + +new Date()
  //   }).then(function() {
  //     $scope.getList();
  //   });
  // };
  //
  // function editRuleCtrl($scope, $mdDialog, FraudFilterRuleOptions) {
  //   if (this.item) {
  //     this.title = 'edit';
  //     // $scope.campaigns = this.item.campaigns;
  //     // AutomatedRule.get({id: this.item.id}, function(result) {
  //     //   $scope.item = result.data;
  //     // });
  //   } else {
  //     this.title = "add";
  //   }
  //   this.titleType = 'Rule';
  //   $scope.conditions = FraudFilterRuleOptions.condition;
  //
  //   this.save = function() {
  //     $scope.editForm.$setSubmitted();
  //     if ($scope.editForm.$valid) {
  //       $scope.saveStatus = true;
  //       $scope.item.conditions = $scope.conditionArray;
  //       AutomatedRule.save($scope.item, success);
  //     }
  //   }
  //
  //   function success(item) {
  //     $scope.saveStatus = false;
  //     if(item.status == 0) {
  //       $scope.errMessage = item.message;
  //       return;
  //     } else {
  //       $mdDialog.hide();
  //     }
  //   }
  //
  //   this.cancel = $mdDialog.cancel;
  // }


})();
