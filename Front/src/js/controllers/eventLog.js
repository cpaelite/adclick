(function () {
    'use strict';

    angular.module('app')
        .controller('EventLogCtrl', [
            '$scope', '$mdDialog', 'EventLog',
            EventLogCtrl
        ]);

    function EventLogCtrl($scope, $mdDialog, EventLog) {
      $scope.query = {
        page: 1,
        limit: 50
      };

      $scope.hours = [];
      for (var i=0; i<24; ++i) {
        if (i < 10) {
          $scope.hours.push('0' + i + ':00');
        } else {
          $scope.hours.push('' + i + ':00');
        }
      }

      function success(items) {
        $scope.items = items.data;
      }
      $scope.getList = function () {
        $scope.promise = EventLog.get($scope.query, success).$promise;
      };

      $scope.refreshDate = function () {
        $scope.getList();
      };

      $scope.detailItem = function (ev, item) {
        $mdDialog.show({
          clickOutsideToClose: true,
          scope: $scope,
          preserveScope: true,
          template: '<md-dialog>' +
          '  <md-dialog-content>' +
          '     {{item.name}}' +
          '  </md-dialog-content>' +
          '</md-dialog>',

          controller: function DialogController($scope, $mdDialog) {
            $scope.closeDialog = function() {
              $mdDialog.hide();
            }
          }
        });
      };

      $scope.$watch('filter', function (newValue, oldValue) {
        if (!newValue) {
          $scope.filter = {
            user: 0,
            action: 0,
            entityType: 0,
            datetype: "1"
          };
          $scope.fromTime = "00:00";
          $scope.toTime = "23:59";
          return;
        }

        if (angular.equals(newValue, oldValue)) {
          return;
        } else {
          $scope.query.page = 1;
        }

        getDateRange($scope.filter.datetype);
        $scope.query.from = $scope.fromDate + "T" + $scope.fromTime;
        $scope.query.to = $scope.toDate + "T" + $scope.toTime;
        $scope.query.userId = $scope.filter.user;
        $scope.query.actionType = $scope.filter.action;
        $scope.query.category = $scope.filter.entityType;

        $scope.getList();
      }, true);

      $scope.$watch('filterDate', function (newValue, oldValue) {
        if (!newValue) {
          $scope.filterDate = {
            fromDate: moment().format('YYYY-MM-DD'),
            toDate: moment().format('YYYY-MM-DD'),
            fromTime: "00:00",
            toTime: "00:00"
          }
        }

        if (!oldValue) {
          return;
        }

        $scope.query.from = moment($scope.filterDate.fromDate).format('YYYY-MM-DD') + "T" + $scope.filterDate.fromTime;
        $scope.query.to = moment($scope.filterDate.toDate).format('YYYY-MM-DD') + "T" + $scope.filterDate.toTime;
        $scope.query.userId = $scope.filter.user;
        $scope.query.actionType = $scope.filter.action;
        $scope.query.category = $scope.filter.entityType;

        $scope.getList();
      }, true);

      function getDateRange(value) {
        var fromDate;
        var toDate;
        switch (value) {
          case "0":
            fromDate = moment().format('YYYY-MM-DD');
            toDate = fromDate;
            break;
          case "1":
            fromDate = moment().format('YYYY-MM-DD');
            toDate = fromDate;
            break;
          case "2":
            fromDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
            toDate = fromDate;
            break;
          case "3":
            fromDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
            toDate = moment().format('YYYY-MM-DD');
            break;
          case "4":
            fromDate = moment().subtract(13, 'days').format('YYYY-MM-DD');
            toDate = moment().format('YYYY-MM-DD');
            break;
          case "5":
            fromDate = moment().day(1).format('YYYY-MM-DD');
            toDate = moment().format('YYYY-MM-DD');
            break;
          case "6":
            fromDate = moment().day(-6).format('YYYY-MM-DD');
            toDate = moment().day(0).format('YYYY-MM-DD');
            break;
          case "7":
            fromDate = moment().startOf('month').format('YYYY-MM-DD');
            toDate = moment().format('YYYY-MM-DD');
            break;
          case "8":
            fromDate = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
            toDate = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
            break;
        }
        if (value == '0') {
          $scope.fromTime = "00:00";
          $scope.toTime = "00:00";
        }
        $scope.fromDate = fromDate;
        $scope.toDate = toDate;
      }
    }
})();
