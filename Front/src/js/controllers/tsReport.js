(function() {
  'use strict';

  angular.module('app').controller('TsreportCtrl', ['$scope', '$timeout', '$q', 'TemplateTrafficSource', 'ThirdPartyTrafficSource', 'Profile', 'DateRangeUtil', '$mdDialog', 'TrafficSourceSyncTask', 'TrafficSourceStatis', TsreportCtrl]);

  function TsreportCtrl($scope, $timeout, $q, TemplateTrafficSource, ThirdPartyTrafficSource, Profile, DateRangeUtil, $mdDialog, TrafficSourceSyncTask, TrafficSourceStatis) {
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.$q = $q;
    this.TemplateTrafficSource = TemplateTrafficSource;
    this.ThirdPartyTrafficSource = ThirdPartyTrafficSource;
    this.Profile = Profile;
    this.DateRangeUtil = DateRangeUtil;
    this.$mdDialog = $mdDialog;
    this.TrafficSourceSyncTask = TrafficSourceSyncTask;
    this.TrafficSourceStatis = TrafficSourceStatis;

    this.templateTrafficSourceMap = {};
    this.thirdPartyTrafficSourceMap = {};
    this.timezoneMap = {};
    this.pageStatus = {};

    this.$scope.datetype = '1';
    this.$scope.fromDate = this.$scope.fromDate || moment().format('YYYY-MM-DD');
    this.$scope.fromTime = this.$scope.fromTime || '00:00';
    this.$scope.toDate = this.$scope.toDate || moment().add(1, 'days').format('YYYY-MM-DD');
    this.$scope.toTime = this.$scope.toTime || '00:00';
    this.$scope.hours = (function() {
      var hours = [];
      for (var i = 0; i < 24; ++i) {
        if (i < 10) {
          hours.push('0' + i + ':00');
        } else {
          hours.push('' + i + ':00');
        }
      }
      return hours;
    })();

    this.$scope.query = {
      page: 1,
      limit: 50,
      order: 'clicks',
      __tk: 0
    };

    this.$scope.groupBy = '';
    this.$scope.groupBys = [];

    this.$scope.taskProgress = {};

    this.init();
    this.initEvent();
  }

  TsreportCtrl.prototype.init = function() {
    var self = this, initPromises = [];

    initPromises.push(self._getTemplateTrafficSource());
    initPromises.push(self._getThirdPartyTrafficSource());
    initPromises.push(self._getProfile());

    self.$q.all(initPromises).then(initSuccess);

    function initSuccess() {
      self.$scope.templateTrafficSources.forEach(function(data) {
        self.templateTrafficSourceMap[data.id] = data;
      });
      self.$scope.thirdPartyTrafficSources.forEach(function(data) {
        self.thirdPartyTrafficSourceMap[data.id] = data;
      });
      var thirdPartyTrafficSources = self.$scope.thirdPartyTrafficSources;
      if(thirdPartyTrafficSources.length > 0) {
        self.$scope.thirdPartyTrafficSourceId = thirdPartyTrafficSources[0].id;
        // self.$scope.meshSizeArr = self.templateTrafficSourceMap[thirdPartyTrafficSources[0].trustedTrafficSourceId].apiMeshSize.split(',');
        // var apiTimezoneArr = self.templateTrafficSourceMap[thirdPartyTrafficSources[0].trustedTrafficSourceId].apiTimezones;
        // var isExist = apiTimezoneArr.some(function(timezone) {
        //   return timezone.id == self.$scope.timezoneId;
        // });
        // self.$scope.timezoneId = isExist ? self.$scope.timezoneId : apiTimezoneArr[0].id;
        // self.$scope.timezones = apiTimezoneArr;
        // apiTimezoneArr.forEach(function(timezone) {
        //   self.timezoneMap[timezone.id] = timezone;
        // });
        // if(self.$scope.meshSizeArr.length > 0) {
        //   self.$scope.meshSizeId = self.$scope.meshSizeArr[0];
        // }
        self.setFilter(thirdPartyTrafficSources[0].trustedTrafficSourceId);
        self.checkTrafficSourceTask.call(self, thirdPartyTrafficSources[0].id);
      }
    }
  };

  TsreportCtrl.prototype.initEvent = function() {
    var self = this, $scope = this.$scope;

    $scope.load = function($event) {
      self.getDateRange($scope.datetype);
      var params = {}, timezone = self.timezoneMap[$scope.timezoneId];
      angular.extend(params, self.pageStatus, {
        tsId: $scope.thirdPartyTrafficSourceId,
        meshSize: $scope.meshSizeId,
        tzShift: timezone.shift,
        tzParam: timezone.param,
        tzId: timezone.id
      });

      $scope.report = {rows: [], totalRows: 0};
      $scope.taskProgress[$scope.thirdPartyTrafficSourceId] = {
        offerStatus: false,
        progressStatus: true
      };
      self.TrafficSourceSyncTask.save(params, function(oData) {
        if(oData.status == 1) {
          $scope.taskId = oData.data.taskId;
          self.checkTrafficSourceTask($scope.thirdPartyTrafficSourceId);
        }
      });
    };

    $scope.thirdPartyTrafficSourceChanged = function(id) {
      $scope.taskId = '';
      $scope.thirdPartyTrafficSourceId = id;
      self.checkTrafficSourceTask(id);
      // reset Timezone、Mesh size
      self.setFilter(self.thirdPartyTrafficSourceMap[id].trustedTrafficSourceId);
    };

    $scope.onGroupByChanged = function() {
      $scope.query.page = 1;
      $scope.query.__tk++;
    };

    $scope.addOrEditTsReference = function(tsId) {
      var item = tsId ? self.thirdPartyTrafficSourceMap[tsId] : null;
      self.$mdDialog.show({
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: ['$mdDialog', '$scope', 'ThirdPartyTrafficSource', TsReferenceCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {item: angular.copy(item), templateTrafficSources: self.$scope.templateTrafficSources, thirdPartyTrafficSources: self.$scope.thirdPartyTrafficSources, templateTrafficSourceMap: self.templateTrafficSourceMap},
        templateUrl: 'tpl/ts-reference-dialog.html?' + +new Date()
      }).then(function() {
        self._getThirdPartyTrafficSource().then(function(oData) {
          self.$scope.thirdPartyTrafficSources.forEach(function(data) {
            self.thirdPartyTrafficSourceMap[data.id] = data;
          });
        });
      });
    };

    $scope.$watch('query', function (newVal, oldVal) {
      if (!newVal || !newVal.limit) {
        return;
      }
      if (angular.equals(newVal, oldVal)) {
        return;
      }
      if (oldVal && (newVal.order != oldVal.order || newVal.limit != oldVal.limit) && newVal.page > 1) {
        $scope.query.page = 1;
        return;
      }

      self.getThirdOffers();
    }, true);
  };

  TsreportCtrl.prototype.setFilter = function(trustedTrafficSourceId) {
    var self = this, $scope = this.$scope;
    self.$scope.meshSizeArr = self.templateTrafficSourceMap[trustedTrafficSourceId].apiMeshSize.split(',');
    var apiTimezoneArr = self.templateTrafficSourceMap[trustedTrafficSourceId].apiTimezones;
    var isExist = apiTimezoneArr.some(function(timezone) {
      return timezone.id == self.$scope.timezoneId;
    });
    self.$scope.timezoneId = isExist ? self.$scope.timezoneId : apiTimezoneArr[0].id;
    self.$scope.timezones = apiTimezoneArr;
    apiTimezoneArr.forEach(function(timezone) {
      self.timezoneMap[timezone.id] = timezone;
    });
    if(self.$scope.meshSizeArr.length > 0) {
      self.$scope.meshSizeId = self.$scope.meshSizeArr[0];
    }
    var apiDimensions = self.templateTrafficSourceMap[trustedTrafficSourceId].apiDimensions;
    $scope.groupBys = [];
    for(var key in apiDimensions) {
      $scope.groupBys.push({
        display: apiDimensions[key],
        name: key
      });
    }
    $scope.groupBy = $scope.groupBys[0].name;
  };

  TsreportCtrl.prototype.getThirdOffers = function() {
    var self = this, $scope = this.$scope;
    var params = {}, timezone = self.timezoneMap[$scope.timezoneId];
    angular.extend(params, $scope.query, {
      groupBy: $scope.groupBy,
      taskId: $scope.taskId
    });
    delete params.__tk;
    $scope.promise = self.TrafficSourceStatis.get(params, function(result) {
      if(result.status == 1) {
        $scope.report = result.data;
      }
    }).$promise;
  };

  TsreportCtrl.prototype.checkTrafficSourceTask = function(id) {
    var self = this, $timeout = this.$timeout, $scope = this.$scope;
    if(!$scope.taskProgress[id]) {
      $scope.taskProgress[id] = {
        offerStatus: false,
        progressStatus: false
      };
    }
    if(!$scope.taskProgress[id].status) {
      $scope.taskProgress[id].status = false;
    }

    function setFilterValue(data) {
      $scope.datetype = '0';
      $scope.fromDate = data.from.split('T')[0];
      $scope.toDate = data.to.split('T')[0];
      $scope.fromTime = data.from.split('T')[1];
      $scope.toTime = data.to.split('T')[1];
      $scope.meshSizeId = data.meshSize;
      $scope.timezoneId = data.tzId;
    }

    self.TrafficSourceSyncTask.get({thirdPartyTrafficSourceId: id}, function(oData) {
      if(oData.status == 1 && oData.data.length > 0) {
        var data = oData.data[0];
        if(data.status == 0 || data.status == 1) { // create or running
          $scope.taskProgress[id].progressStatus = true;
          if(!$scope.taskProgress[id].progress) {
            $scope.taskProgress[id].progress = Math.random()*40 + 10;
            self.loadOfferProgress(id);
          }
          $timeout(function() {
            if($scope.thirdPartyTrafficSourceId == id) {
              self.checkTrafficSourceTask(id);
            }
          }, 3000);
        } else if (data.status == 2) { // error
          $scope.taskProgress[id].progressStatus = false;
          $scope.taskProgress[id].taskErrorMeg = data.message;
          if($scope.taskProgress[id].progress) {
            self.loadOfferProgress(id, true, true);
          }
          setFilterValue(data);
        } else if(data.status == 3) { // Finish
          $scope.taskProgress[id].progressStatus = false;
          $scope.taskProgress[id].offerStatus = true;
          $scope.taskId = data.id;
          setFilterValue(data);
          if($scope.taskProgress[id].progress) {
            self.loadOfferProgress(id, true);
          } else {
            $scope.query.page = 1;
            $scope.query.__tk++;
          }
        }
      } else if (oData.status == 1 && oData.data.length == 0) {
        $scope.taskProgress[id].offerStatus = true;
        $scope.report = {rows: [], totalRows: 0};
      }
    });
  };

  TsreportCtrl.prototype.loadOfferProgress = function(id, isFinished, isError) {
    var self = this, $timeout = this.$timeout, $scope = this.$scope;
    if(isFinished) {
        $scope.taskProgress[id].progress = 100;
        $scope.taskProgress[id].progressNum = 100;
        if(!isError) {
          $scope.query.page = 1;
          $scope.query.__tk++;
        }
    } else {
      $timeout(function() {
        if($scope.taskProgress[id].progress < 80 && $scope.taskProgress[id].status == false) {
          $scope.taskProgress[id].progress = $scope.taskProgress[id].progress + (Math.random()/10);
          $scope.taskProgress[id].progressNum = new Number($scope.taskProgress[id].progress).toFixed(2);
          self.loadOfferProgress(id);
        } else if($scope.taskProgress[id].progress <= 98 && $scope.taskProgress[id].progress >= 80 && $scope.taskProgress[id].status == false) {
          $scope.taskProgress[id].progress = $scope.taskProgress[id].progress + (Math.random()/100);
          $scope.taskProgress[id].progressNum = new Number($scope.taskProgress[id].progress).toFixed(2);
          self.loadOfferProgress(id);
        }
      }, 100);
    }
  };

  TsreportCtrl.prototype.getDateRange = function(value) {
    var self = this, DateRangeUtil = self.DateRangeUtil;
    var fromDate = DateRangeUtil.fromDate(value);
    var toDate = DateRangeUtil.toDate(value);
    if (value == '0') {
      self.pageStatus.from = moment(self.$scope.fromDate).format('YYYY-MM-DD') + 'T' + self.$scope.fromTime;
      self.pageStatus.to = moment(self.$scope.toDate).format('YYYY-MM-DD') + 'T' + self.$scope.toTime;
    } else {
      self.pageStatus.from = fromDate + 'T00:00';
      self.pageStatus.to = toDate + 'T00:00';
    }
  };

  TsreportCtrl.prototype._getTemplateTrafficSource = function() {
    var self = this;
    return self.TemplateTrafficSource.get({support: true}, function(oData) {
      self.$scope.templateTrafficSources = oData.data.lists;
    }).$promise;
  };

  TsreportCtrl.prototype._getThirdPartyTrafficSource = function() {
    var self = this;
    return self.ThirdPartyTrafficSource.get(null, function(oData) {
      self.$scope.thirdPartyTrafficSources = oData.data.lists;
    }).$promise;
  };

  TsreportCtrl.prototype._getProfile = function() {
    var self = this;
    return self.Profile.get(null, function(oData) {
      self.$scope.timezoneId = oData.data.timezoneId;
    }).$promise;
  };

  TsreportCtrl.groupBy = [
    {
      display: 'CampaignId',
      name: 'campaignId'
    },
    {
      display: 'WebsiteId',
      name: 'websiteId'
    },
    {
      display: 'V1',
      name: 'v1'
    },
    {
      display: 'V2',
      name: 'v2'
    },
    {
      display: 'V3',
      name: 'v3'
    },
    {
      display: 'V4',
      name: 'v4'
    },
    {
      display: 'V5',
      name: 'v5'
    },
    {
      display: 'V6',
      name: 'v6'
    },
    {
      display: 'V7',
      name: 'v7'
    },
    {
      display: 'V8',
      name: 'v8'
    },
    {
      display: 'V9',
      name: 'v9'
    },
    {
      display: 'V10',
      name: 'v10'
    }
  ];

  function TsReferenceCtrl($mdDialog, $scope, ThirdPartyTrafficSource) {
    this.$mdDialog = $mdDialog;
    this.$scope = $scope;
    this.ThirdPartyTrafficSource = ThirdPartyTrafficSource;

    this.init();
    this.initEvent();
  }

  TsReferenceCtrl.prototype.init = function() {
    this.title = this.item ? 'edit' : 'add';
    this.cancel = this.$mdDialog.cancel;
    this.$scope.templateTrafficSources = this.templateTrafficSources;
    if(this.item) {
      this.$scope.templateTrafficSourceObj = this.templateTrafficSourceMap[this.item.trustedTrafficSourceId] || {};
      this.item.trustedTrafficSourceId = this.item.trustedTrafficSourceId.toString();
      this.$scope.formData = this.item;
    }
  };

  TsReferenceCtrl.prototype.initEvent = function() {
    var self = this, thirdPartyTrafficSources = this.thirdPartyTrafficSources;
    self.$scope.checkName = function(name, id) {
      self.$scope.editForm.name.$setValidity('checkName', !(thirdPartyTrafficSources.some(function(thirdPartyTrafficSource) {
        if(id && id == thirdPartyTrafficSource.id) {
          return false;
        }
        return thirdPartyTrafficSource.name == name;
      })));
    };
    self.$scope.tsChanged = function(id) {
      self.$scope.templateTrafficSourceObj = self.templateTrafficSourceMap[id];
    };
    self.save = function() {
      self.$scope.editForm.$setSubmitted();
      if(self.$scope.editForm.$valid) {
        self.$scope.saveStatus = true;
        var formData = angular.copy(self.$scope.formData), templateTrafficSourceObj = self.$scope.templateTrafficSourceObj;
        formData.trafficId = formData.trustedTrafficSourceId;
        delete formData.trustedTrafficSourceId;
        if(+templateTrafficSourceObj.apiMode == 1) {
          delete formData.password;
          delete formData.account;
        } else if (+templateTrafficSourceObj.apiMode == 2) {
          delete formData.token;
        }
        if(self.item) {
          self.ThirdPartyTrafficSource.update({id: self.item.id}, formData, function(oData) {
            self.$mdDialog.hide();
            self.$scope.saveStatus = false;
          });
        } else {
          self.ThirdPartyTrafficSource.save(formData, function(oData) {
            self.$mdDialog.hide();
            self.$scope.saveStatus = false;
          });
        }
      }
    };
  };
})();
