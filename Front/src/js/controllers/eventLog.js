(function () {
  'use strict';

  angular.module('app')
    .controller('EventLogCtrl', [
      '$scope', '$mdDialog', 'Profile', 'EventLog',
      EventLogCtrl
    ]);

  function EventLogCtrl($scope, $mdDialog, Profile, EventLog) {
    $scope.app.subtitle = "EventLog";
    $scope.hours = [];
    for (var i = 0; i < 24; ++i) {
      if (i < 10) {
        $scope.hours.push('0' + i + ':00');
      } else {
        $scope.hours.push('' + i + ':00');
      }
    }
    $scope.filter = {
      userId: "ALL",
      actionType: 0,
      entityType: 0,
      datetype: "1"
    };
    getDateRange($scope.filter.datetype);
    $scope.fromTime = "00:00";
    $scope.toTime = "00:00";

    $scope.filterDate = {
      fromDate: moment().format('YYYY-MM-DD'),
      toDate: moment().add(1, 'days').format('YYYY-MM-DD'),
      fromTime: "00:00",
      toTime: "00:00"
    };

    $scope.query = {
      page: 1,
      limit: 50,
      from: $scope.fromDate + "T" + $scope.fromTime,
      to: $scope.toDate + "T" + $scope.toTime,
      userId: $scope.filter.userId,
      actionType: $scope.filter.actionType,
      entityType: $scope.filter.entityType
    };

    var profilePromise = Profile.get(null).$promise;
    profilePromise.then(function (profile) {
      $scope.query.tz = profile.data.timezone;
      $scope.getList();
    });

    function success(items) {
      $scope.items = items.data;
    }

    $scope.getList = function () {
      EventLog.get($scope.query, success);
    };

    $scope.refreshDate = function () {
      $scope.getList();
    };

    $scope.$watch('filter', function (newValue, oldValue) {
      if (angular.equals(newValue, oldValue)) {
        return;
      } else {
        $scope.query.page = 1;
      }

      getDateRange($scope.filter.datetype);
      $scope.query.from = $scope.fromDate + "T" + $scope.fromTime;
      $scope.query.to = $scope.toDate + "T" + $scope.toTime;
      $scope.query.userId = $scope.filter.userId;
      $scope.query.actionType = $scope.filter.actionType;
      $scope.query.entityType = $scope.filter.entityType;

      $scope.getList();
    }, true);

    $scope.$watch('filterDate', function (newValue, oldValue) {
      if (angular.equals(newValue, oldValue)) {
        return;
      } else {
        $scope.query.page = 1;
      }

      $scope.query.from = moment($scope.filterDate.fromDate).format('YYYY-MM-DD') + "T" + $scope.filterDate.fromTime;
      $scope.query.to = moment($scope.filterDate.toDate).format('YYYY-MM-DD') + "T" + $scope.filterDate.toTime;
      $scope.query.userId = $scope.filter.userId;
      $scope.query.actionType = $scope.filter.actionType;
      $scope.query.entityType = $scope.filter.entityType;

      $scope.getList();
    }, true);

    $scope.detailItem = function (ev, item) {
      $mdDialog.show({
        clickOutsideToClose: false,
        controller: ['$scope', '$mdDialog', detailItemCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {item: item},
        bindToController: true,
        targetEvent: ev,
        templateUrl: 'tpl/eventlog-detail-dialog.html'
      });

    };

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
      $scope.fromDate = fromDate;
      $scope.toDate = toDate;
    }
  }

  function detailItemCtrl($scope, $mdDialog) {
    this.title = "Detail";
    $scope.item = this.item;

    this.ok = function() {
      $mdDialog.hide();
    }
  }

})();
