(function () {
  'use strict';

  angular.module('app')
    .controller('TsreportCtrl', [
      '$scope', '$timeout', 'Domains', 'DefaultPostBackUrl', 'TrafficSource', 'Tsreport', '$mdDialog', 'TsReference', 'ThirdTraffic', TsreportCtrl
    ]);

  function TsreportCtrl($scope, $timeout, Domains, DefaultPostBackUrl, TrafficSource, Tsreport, $mdDialog, TsReference, ThirdTraffic) {
    var pageStatus = {};

    $scope.fromDate = $scope.fromDate || moment().format('YYYY-MM-DD');
    $scope.fromTime = $scope.fromTime || '00:00';
    $scope.toDate = $scope.toDate || moment().add(1, 'days').format('YYYY-MM-DD');
    $scope.toTime = $scope.toTime || '00:00';

    $scope.query = {
      page: 1,
      tsReferenceId: '',
      __tk: 0
    };

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
      if (!newVal || !newVal.limit || !newVal.tsReferenceId) {
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
      getDateRange($scope.datetype);
      $scope.query.page = 1;
      $scope.query.__tk += 1;
    };

    $scope.start = function(item) {
      var params = angular.copy(item);
      params.status = !params.status;
      Tsreport.update({id: params.campaignId}, params, function() {
        item.status = !item.status;
        getList();
      });
    };

    $scope.addOrEditTsReference = function(tsId) {
      var item;
      $scope.tsReferences.forEach(function(v) {
        if(v.id = tsId) {
          item = v;
          return;
        }
      });
      $mdDialog.show({
        clickOutsideToClose: true,
        controller: ['$mdDialog', '$scope', 'TsReference', tsReferenceCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {item: angular.copy(item), thirdTraffics: $scope.thirdTraffics},
        templateUrl: 'tpl/ts-reference-dialog.html'
      }).then(function() {
        getList();
        getTsReferences();
      });
    };

    $scope.pause = function(item) {
      $mdDialog.show({
        clickOutsideToClose: true,
        controller: ['$mdDialog', 'Tsreport', pauseCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {item: item},
        bindToController: true,
        templateUrl: 'tpl/delete-confirm-dialog.html'
      }).then(function() {
        item.status = !item.status;
        getList();
      })
    };

    getTsReferences();
    getThirdTraffic();

    function getTsReferences() {
      TsReference.get(null, function(oData) {
        $scope.tsReferences = oData.data.tsreferences;
        if(!$scope.query.tsReferenceId && $scope.tsReferences && $scope.tsReferences.length > 0) {
          $scope.query.tsReferenceId = $scope.tsReferences[0].id;
        }
      });
    }

    function getThirdTraffic() {
      ThirdTraffic.get(null, function(oData) {
          $scope.thirdTraffics = oData.data.thirdTraffics;
      });
    }

    function getList() {
      var params = {};
      angular.extend(params, $scope.query, pageStatus);
      delete params.__tk;
      Tsreport.get(params, function(result) {
        $scope.report = result.data;
      });
    }

    function pauseCtrl($mdDialog, Tsreport) {
      var self = this;
      this.title = "confirmPauseTitle";
      this.content = 'confirmPauseContent';
      this.cancel = $mdDialog.cancel;
      var params = angular.copy(this.item);
      params.status = !params.status;

      this.ok = function () {
        Tsreport.update({id: params.campaignId}, params, function(oData) {
          $mdDialog.hide();
        });
      };
    }

    function tsReferenceCtrl($mdDialog, $scope, TsReference) {
      var self = this;

      this.title = this.item ? 'edit' : 'add';
      this.cancel = $mdDialog.cancel;
      if(this.item) {
        this.item.tsId = this.item.tsId.toString();
        $scope.formData = this.item;
      }

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
        if(self.item) {
          TsReference.update({id: self.item.id}, $scope.formData, function(oData) {
            $mdDialog.hide();
          });
        } else {
          TsReference.save($scope.formData, function(oData) {
            $mdDialog.hide();
          });
        }
      };
    }

    function getDateRange(value) {
      var fromDate = moment().format('YYYY-MM-DD');
      var toDate = moment().add(1, 'days').format('YYYY-MM-DD');
      switch (value) {
        case '2':
          fromDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
          toDate = moment().format('YYYY-MM-DD');
          break;
        case '3':
          fromDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
          break;
        case '4':
          fromDate = moment().subtract(13, 'days').format('YYYY-MM-DD');
          break;
        case '5':
          fromDate = moment().day(1).format('YYYY-MM-DD');
          break;
        case '6':
          fromDate = moment().day(-6).format('YYYY-MM-DD');
          toDate = moment().day(1).format('YYYY-MM-DD');
          break;
        case '7':
          fromDate = moment().startOf('month').format('YYYY-MM-DD');
          break;
        case '8':
          fromDate = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
          toDate = moment().startOf('month').format('YYYY-MM-DD');
          break;
      }
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
