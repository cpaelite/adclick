(function () {
  'use strict';

  angular.module('app')
    .controller('TsreportCtrl', [
      '$scope', '$timeout', 'Domains', 'DefaultPostBackUrl', 'TrafficSource', 'Tsreport', '$mdDialog', 'TsReference', 'ThirdTraffic', 'TsCampaign', 'toastr', 'DateRangeUtil', TsreportCtrl
    ]);

  function TsreportCtrl($scope, $timeout, Domains, DefaultPostBackUrl, TrafficSource, Tsreport, $mdDialog, TsReference, ThirdTraffic, TsCampaign, toastr, DateRangeUtil) {
    var pageStatus = {};

    $scope.fromDate = $scope.fromDate || moment().format('YYYY-MM-DD');
    $scope.fromTime = $scope.fromTime || '00:00';
    $scope.toDate = $scope.toDate || moment().add(1, 'days').format('YYYY-MM-DD');
    $scope.toTime = $scope.toTime || '00:00';

    $scope.query = {
      page: 1,
      __tk: 0
    };

    $scope.tsReferenceId = '';

    $scope.datetype = '1';
    getDateRange($scope.datetype);
    $scope.hours = [];
    for (var i = 0; i < 24; ++i) {
      if (i < 10) {
        $scope.hours.push('0' + i + ':00');
      } else {
        $scope.hours.push('' + i + ':00');
      }
    }

    $scope.trafficSources = [];

    var unwatch = $scope.$watch('preferences', function(newVal, oldVal) {
      if (!newVal)
        return;

      angular.extend($scope.query, {
        limit: newVal.reportViewLimit,
        order: newVal.reportViewOrder,
        tz: newVal.reportTimeZone
      });

      unwatch();
      unwatch = null;
    }, true);

    $scope.$watch('query', function (newVal, oldVal) {
      if (!newVal || !newVal.limit || !$scope.tsReferenceId) {
        return;
      }
      if (angular.equals(newVal, oldVal)) {
        return;
      }
      if (oldVal && (newVal.order != oldVal.order || newVal.limit != oldVal.limit) && newVal.page > 1) {
        $scope.query.page = 1;
        return;
      }

      getList();
    }, true);

    $scope.applySearch = function() {
      $scope.disabled = true;
      getDateRange($scope.datetype);
      $scope.query.page = 1;
      $scope.query.__tk += 1;
    };

    $scope.start = function(item) {
      if(item.startStatus) {
        return;
      } else {
        item.startStatus = true;
      }
      TsCampaign.save({id: item.campaignId}, {
        tsReferenceId: $scope.tsReferenceId,
        action: 'start'
      }, function(oData) {
        if(oData.status) {
          toastr.success(oData.message);
        }
        item.startStatus = false;
      });
    };

    $scope.addOrEditTsReference = function(tsId) {
      var item;
      $scope.tsReferences.forEach(function(v) {
        if(v.id == tsId) {
          item = v;
          return;
        }
      });
      $mdDialog.show({
        clickOutsideToClose: true,
        escapeToClose: false,
        controller: ['$mdDialog', '$scope', 'TsReference', tsReferenceCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {item: angular.copy(item), thirdTraffics: $scope.thirdTraffics, tsReferences: $scope.tsReferences},
        templateUrl: function() {
          return 'tpl/ts-reference-dialog.html?' + +new Date();
        }
      }).then(function() {
        //getList();
        getTsReferences();
      });
    };

    $scope.pause = function(item) {
      $mdDialog.show({
        clickOutsideToClose: true,
        controller: ['$mdDialog', 'Tsreport', 'TsCampaign', pauseCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {item: item, tsReferenceId: $scope.tsReferenceId},
        bindToController: true,
        templateUrl: function() {
          return 'tpl/delete-confirm-dialog.html?' + +new Date();
        }
      }).then(function(oData) {
        if(oData.status) {
          toastr.success(oData.message);
        }
      })
    };

    getTsReferences();
    getThirdTraffic();

    function getTsReferences() {
      TsReference.get(null, function(oData) {
        $scope.tsReferences = oData.data.tsreferences;
        if(!$scope.tsReferenceId && $scope.tsReferences && $scope.tsReferences.length > 0) {
          $scope.tsReferenceId = $scope.tsReferences[0].id;
        }
      });
    }

    function getThirdTraffic() {
      ThirdTraffic.get(null, function(oData) {
          $scope.thirdTraffics = oData.data.thirdTraffics;
      });
    }

    $scope.btnName = 'Refresh';
    function getList() {
      var params = {};
      angular.extend(params, $scope.query, pageStatus, {tsReferenceId: $scope.tsReferenceId});
      delete params.__tk;
      $scope.promise = Tsreport.get(params, function(result) {
        $scope.report = result.data;

        $scope.disabled = false;
        $scope.btnName = 'Refresh';
        $scope.applyBtn = false;
      }).$promise;
    }
    $scope.$watch('datetype + fromDate + fromTime + toDate + toTime ', function(newVal, oldVal) {
      if (newVal != oldVal) {
        $scope.applyBtn = true;
        $scope.btnName = 'apply';
      }
    }, true);

    $scope.$watch('tsReferenceId', function(newVal, oldVal) {
      if (newVal != oldVal && oldVal) {
        $scope.applyBtn = true;
        $scope.btnName = 'apply';
      }
    }, true);

    function pauseCtrl($mdDialog, Tsreport, TsCampaign) {
      var self = this;
      this.title = "confirmPauseTitle";
      this.content = 'confirmPauseContent';
      this.cancel = $mdDialog.cancel;

      this.ok = function () {
        if(self.item.pauseStatus) {
          return;
        } else {
          self.item.pauseStatus = true;
        }
        TsCampaign.save({id: self.item.campaignId}, {
          tsReferenceId: self.tsReferenceId,
          action: 'pause'
        }, function(oData) {
          $mdDialog.hide(oData);
          self.item.pauseStatus = false;
        });
      };
    }

    function tsReferenceCtrl($mdDialog, $scope, TsReference) {
      var self = this;
      var tsReferences = this.tsReferences;
      this.title = this.item ? 'edit' : 'add';
      this.cancel = $mdDialog.cancel;
      if(this.item) {
        this.item.tsId = this.item.tsId.toString();
        $scope.formData = this.item;
      }

      $scope.checkName = function(name, id) {
        $scope.editForm.name.$setValidity('checkName', !(tsReferences.some(function(tsReference) {
          if(id && id == tsReference.id) {
            return false;
          }
          return tsReference.name == name;
        })));
      };

      $scope.thirdTraffics = this.thirdTraffics;

      // $scope.tsChanged = function(id) {
      //   if(!id) {
      //     $scope.formData.api = '';
      //     return;
      //   }
      //   $scope.thirdTraffics.some(function(v) {
      //     if (v.id == id) {
      //       $scope.formData.api = v.api;
      //       return true;
      //     }
      //   });
      // };

      this.save = function() {
        $scope.editForm.$setSubmitted();
        if($scope.editForm.$valid) {
          $scope.saveStatus = true;
          if(self.item) {
            TsReference.update({id: self.item.id}, $scope.formData, function(oData) {
              $mdDialog.hide();
              $scope.saveStatus = false;
            });
          } else {
            TsReference.save($scope.formData, function(oData) {
              $mdDialog.hide();
              $scope.saveStatus = false;
            });
          }
        }
      };
    }

    function getDateRange(value) {
      var fromDate = DateRangeUtil.fromDate(value);
      var toDate = DateRangeUtil.toDate(value);
      if (value == '0') {
        pageStatus.from = moment($scope.fromDate).format('YYYY-MM-DD') + 'T' + $scope.fromTime;
        pageStatus.to = moment($scope.toDate).format('YYYY-MM-DD') + 'T' + $scope.toTime;
      } else {
        pageStatus.from = fromDate + 'T00:00';
        pageStatus.to = toDate + 'T00:00';
      }
    }
  }
})();
