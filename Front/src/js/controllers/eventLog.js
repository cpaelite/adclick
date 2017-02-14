(function () {
    'use strict';

    angular.module('app')
        .controller('EventLogCtrl', [
            '$scope', 'EventLog',
            EventLogCtrl
        ]);

    function EventLogCtrl($scope, EventLog) {
      $scope.filter = {
        user: 0,
        action: 0,
        entityType: 0,
        datetype: "1",
        fromTime: "00:00",
        toTime: "00:00"
      };

      getDateRange($scope.filter.datetype);

      $scope.query = {
        page: 0,
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

      $scope.$watch('filter', function (newValue, oldValue) {
        getDateRange($scope.filter.datetype);

        $scope.query.from = $scope.filter.fromDate + " " + $scope.filter.fromTime;
        $scope.query.to = $scope.filter.toDate + " " + $scope.filter.toTime;
        $scope.query.userId = $scope.filter.user;
        $scope.query.actionType = $scope.filter.action;
        $scope.query.category = $scope.filter.entityType;

        EventLog.get($scope.query, function (log) {
            $scope.item = log.data;
        });
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
            fromDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
            toDate = moment().format('YYYY-MM-DD');
            break;
          case "3":
            fromDate = moment().subtract(13, 'days').format('YYYY-MM-DD');
            toDate = moment().format('YYYY-MM-DD');
            break;
          case "4":
            fromDate = moment().day(1).format('YYYY-MM-DD');
            toDate = moment().format('YYYY-MM-DD');
            break;
          case "5":
            fromDate = moment().day(-6).format('YYYY-MM-DD');
            toDate = moment().day(0).format('YYYY-MM-DD');
            break;
          case "6":
            fromDate = moment().startOf('month').format('YYYY-MM-DD');
            toDate = moment().format('YYYY-MM-DD');
            break;
          case "7":
            fromDate = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
            toDate = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
            break;
        }
        $scope.filter.fromDate = fromDate;
        $scope.filter.toDate = toDate;
      }
    }
})();
