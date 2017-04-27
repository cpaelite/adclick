(function () {
  'use strict';

  angular.module('app')
    .controller('fraudFilterCtrl', [
      '$scope', '$mdDialog', '$q', 'FraudFilter', 'Campaign', 'DateRangeUtil', 'FraudFilterLog',
      FraudFilterCtrl
    ])
    .directive('resizefraud', ['$timeout', '$q', function($timeout, $q) {
      return function(scope, element) {
        function getElementTop(element){
          var actualTop = element.offsetTop;
          var current = element.offsetParent;
          while (current !== null){
            actualTop += current.offsetTop;
            current = current.offsetParent;
          }
          return actualTop;
        }

        var w_h = angular.element(window);
        function getHeight() {
          var deferred = $q.defer();
          $timeout(function() {
            deferred.resolve({
              'w_h': w_h.height(),
              'page_h': angular.element(element).closest('.table-box').next('md-table-pagination').outerHeight(true)
            });
          });
          return deferred.promise;
        }

        function heightResize() {
          getHeight().then(function(newVal) {
            var windowHeight = newVal.w_h;
            var pageHeight = newVal.page_h;
            var elementTop = getElementTop(element[0]);

            angular.element(element).css({
              'height': (windowHeight - elementTop - pageHeight - 43) + 'px'
            });
          });
        }

        heightResize();
        w_h.bind('resize', function() {
          heightResize();
        });
      }
    }]);

  function FraudFilterCtrl($scope,  $mdDialog, $q, FraudFilter, Campaign, DateRangeUtil, FraudFilterLog) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.$q = $q;
    this.FraudFilter = FraudFilter;
    this.Campaign = Campaign;
    this.DateRangeUtil = DateRangeUtil;
    this.FraudFilterLog= FraudFilterLog;

    this.campaigns = [];
    this.campaignMap = {};
    this.$scope.query = {
      page: 1,
      limit: 50,
      status: 1,
      filter: '',
      __tk: 0
    };

    this.$scope.logQuery = {
      page: 1,
      limit: 50,
      filter: '',
      from: '',
      to: '',
      __tk: 0
    };

    this.$scope.datetype = '1';
    this.$scope.tabSelected = 0;
    this.$scope.pathRoute = 'tpl/botBlacklist.html?' + +new Date();

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
      self._getFormatCampaignName();
    }

    $scope.$watch('query', function (newVal, oldVal) {
      if (angular.equals(newVal, oldVal)) {
        return;
      }
      if (oldVal && (newVal.order != oldVal.order || newVal.limit != oldVal.limit || newVal.filter != oldVal.filter || newVal.status != oldVal.status) && newVal.page > 1) {
        $scope.query.page = 1;
      }

      self._getFraudFilters().then(function() {
        self._getFormatCampaignName();
      });
    }, true);

    $scope.$watch('logQuery', function (newVal, oldVal) {
      if (angular.equals(newVal, oldVal)) {
        return;
      }
      if (oldVal && (newVal.order != oldVal.order || newVal.limit != oldVal.limit || newVal.filter != oldVal.filter || newVal.from != oldVal.from || newVal.to != oldVal.to) && newVal.page > 1) {
        $scope.query.page = 1;
      }
      self._getFraudFilterLogs();
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
        if(oData.status == 1) {
          self.$scope.query.__tk++;
        }
      });
    };

    $scope.editRuleItem = function(item) {
      self.$mdDialog.show({
        clickOutsideToClose: true,
        escapeToClose: false,
        controller: ['$scope', '$mdDialog', 'FraudFilterRuleOptions', 'FraudFilter', EditRuleCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {item: item, campaigns: self.campaigns, campaignMap: self.campaignMap},
        templateUrl: 'tpl/fraudFilter-edit-dialog.html?' + +new Date()
      }).then(function() {
        if(self.$scope.tabSelected != 0) {
          self.$scope.tabSelected = 0;
        }
        self.$scope.status = 1;
        self.$scope.query.page = 1;
        self.$scope.query.__tk++;
      });
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

    $scope.logQueryChange = function(datetype) {
      self._getDateRange.call(self, datetype);
    };

    $scope.onLogTabSelected = function() {
      if(!self.$scope.logs) {
        self._getDateRange(self.datetype);
      }
    };

    $scope.viewLogs = function(item) {
      self.$mdDialog.show({
        clickOutsideToClose: false,
        controller: ['$scope', '$mdDialog', 'FraudFilterLog', RuleLogCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {item: item},
        bindToController: true,
        templateUrl: 'tpl/fraud-filter-log-dialog.html?' + +new Date()
      });
    };
  };

  FraudFilterCtrl.prototype._getFraudFilters = function() {
    var self = this, $scope = self.$scope, FraudFilter = self.FraudFilter;
    var params = angular.copy($scope.query);
    delete params.__tk;
    if(params.filter == '') {
      delete params.filter;
    }
    $scope.promise = FraudFilter.get(params, function(oData) {
      $scope.rules = oData.data;
    }).$promise;

    return $scope.promise;
  };

  FraudFilterCtrl.prototype._getCampaigns = function() {
    var self = this, $scope = self.$scope, Campaign = self.Campaign;
    return Campaign.get(null, function(oData) {
      self.campaigns = oData.data;
    }).$promise;
  };

  FraudFilterCtrl.prototype._getFormatCampaignName = function() {
    var self = this, $scope = self.$scope;
    // $scope.rules.rules.map(function(rule) {
    //   var campaignIds = rule.campaigns.split(',');
    //   var campaignNameArr = [];
    //
    //   campaignIds.forEach(function(id) {
    //     campaignNameArr.push(self.campaignMap[id].name);
    //   });
    //   rule.campaignNames = campaignNameArr.join(',');
    // });
  };

  FraudFilterCtrl.prototype._getDateRange = function(value) {
    var self = this, DateRangeUtil = self.DateRangeUtil, $scope = self.$scope;
    var fromDate = DateRangeUtil.fromDate(value);
    var toDate = DateRangeUtil.toDate(value);
    if (value == '0') {
      $scope.logQuery.from = moment().format('YYYY-MM-DD');
      $scope.logQuery.to = moment().add(1, 'days').format('YYYY-MM-DD');
    } else {
      $scope.logQuery.from = fromDate;
      $scope.logQuery.to = toDate;
    }
  };

  FraudFilterCtrl.prototype._getFraudFilterLogs = function() {
    var self = this, $scope = self.$scope, FraudFilterLog = self.FraudFilterLog;
    var params = angular.copy($scope.logQuery);
    delete params.__tk;
    if(params.filter == '') {
      delete params.filter;
    }
    params.from = moment(params.from).format('YYYY-MM-DD');
    params.to = moment(params.to).format('YYYY-MM-DD');
    $scope.logPromise = FraudFilterLog.get(params, function(oData) {
      $scope.logs = oData.data;
    }).$promise;
    return $scope.logPromise;
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
    this.content = 'Are you sure to delete this rule?';

    this.ok = function(){
      FraudFilter.remove({id: self.id}, function(oData) {
        if(oData.status == 1) {
          $mdDialog.hide();
        }
      });
    };
  };

  function RuleLogCtrl($scope, $mdDialog, FraudFilterLog) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.FraudFilterLog = FraudFilterLog;

    this.init();
  }

  RuleLogCtrl.prototype.init = function() {
    var self = this, $mdDialog = self.$mdDialog, $scope = self.$scope;
    self.title = 'Rule Running Log';
    $scope.item = self.item;
    self.cancel = $mdDialog.cancel;
    self._getFraudFilterLogDetail.call(self, self.item);
  };

  RuleLogCtrl.prototype._getFraudFilterLogDetail = function(item) {
    var self = this, FraudFilterLog = self.FraudFilterLog, $scope = self.$scope;

    FraudFilterLog.get({id: item.id}, function(oData) {
      $scope.logDetails = oData.data.logs;
    });
  };

  function EditRuleCtrl($scope, $mdDialog, FraudFilterRuleOptions, FraudFilter) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.FraudFilterRuleOptions = FraudFilterRuleOptions;
    this.FraudFilter = FraudFilter;
    $scope.conditionFilters = FraudFilterRuleOptions.condition;

    this.init();
    this.initEvent();
  }

  EditRuleCtrl.prototype.init = function() {
    var self = this, $scope = self.$scope, $mdDialog = self.$mdDialog;

    this.title = this.item ?  'edit' : 'add';
    this.titleType = 'Rule';
    this.cancel = $mdDialog.cancel;

    $scope.campaignFilter = {
      config: {
          plugins: ['remove_button'],
          valueField: 'id',
          labelField: 'name',
          searchField: ['name']
      },
      options: this.campaigns
    };
    if (self.item) {
      var item = angular.copy(self.item);
      self.FraudFilter.get({id: self.item.id}, function(oData) {
        var data = oData.data;
        data.campaigns = data.campaigns.split(',');
        data.conditions = data.condition;
        $scope.formData = data;
        $scope.conditions = self._formatCondition(data.conditions);
      });
    } else {
      $scope.formData = {
        dimension: 'IP',
        name: '',
        timeSpan: '',
        conditions: '',
        campaigns: []
      }
      $scope.conditions = self._formatCondition();;
    }
  };

  EditRuleCtrl.prototype.initEvent = function() {
    var self = this, $scope = self.$scope, $mdDialog = self.$mdDialog;

    $scope.addCondition = function() {
      var options = self.FraudFilterRuleOptions.condition, conditions = $scope.conditions;
      for(var i = 0, l = options.length; i < l; i++) {
        if(!conditions.some(function(condition) {
          return condition.key == options[i].key;
        })) {
          $scope.conditions.push({
            key: options[i].key,
            operand: '>',
            value: ''
          })
          break;
        }
      }
    };
    $scope.deleteCondition = function(condition) {
      $scope.conditions.splice($scope.conditions.indexOf(condition), 1);
    };
    $scope.conditionDisabled = function(conditionKey, conditionFilterKey) {
      if(conditionKey == conditionFilterKey) {
        return false;
      } else {
        return $scope.conditions.some(function(condition) {
          return conditionFilterKey == condition.key;
        });
      }
    };
    this.save = function() {
      $scope.editForm.$setSubmitted();
      if ($scope.editForm.$valid) {
        $scope.saveStatus = true;
        var postData = angular.copy($scope.formData);
        postData.condition = self._encodeCondition.call(this);
        postData.campaigns = postData.campaigns.join(',');
        if(self.item) {
          self.FraudFilter.update({id: postData.id}, postData, function(oData) {
            if(oData.status == 1) {
              $mdDialog.hide();
            }
          });
        } else {
          self.FraudFilter.save(postData, function(oData) {
            if(oData.status == 1) {
              $mdDialog.hide();
            }
          });
        }
      }
    }
  };

  EditRuleCtrl.prototype._encodeCondition = function() {
    var temArr = [], self = this, $scope = self.$scope;
    $scope.conditions.forEach(function(c) {
      temArr.push(c.key + '' + c.operand + '' + c.value);
    });
    return temArr.join(',')
  };

  EditRuleCtrl.prototype._formatCondition = function(conditionStr) {
    if(!conditionStr) {
      return [{
        key: 'PV',
        operand: '>',
        value: ''
      }];
    }
    var conditionArr = conditionStr.split(','), conditions = [];
    conditionArr.forEach(function(condition) {
      var tem = {}, temArr = '';
      if(condition.indexOf('>') > -1) {
        temArr = condition.split('>');
        tem.operand = '>';
      } else {
        temArr = condition.split('<');
        tem.operand = '<';
      }
      tem.value = temArr[1];
      tem.key = temArr[0];
      conditions.push(tem)
    });

    return conditions;
  };
})();
