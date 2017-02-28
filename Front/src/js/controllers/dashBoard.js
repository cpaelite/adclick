(function () {

  angular.module('app')
    .controller('DashCtrl', [
      '$scope', '$filter', 'Report', 'Profile',
      DashCtrl
    ]);

  function DashCtrl($scope, $filter, Report, Profile) {
    $scope.app.subtitle = 'DashBoard';

    $scope.datetype = 3;
    $scope.fromTime = "00:00";
    $scope.toTime = "00:00";
    Profile.get(null, function (profile) {
      $scope.hours = [];
      for (var i = 0; i < 24; ++i) {
        if (i < 10) {
          $scope.hours.push('0' + i + ':00');
        } else {
          $scope.hours.push('' + i + ':00');
        }
      }

      getDateRange($scope.datetype);

      $scope.filter = {
        fromDate: moment().format('YYYY-MM-DD'),
        toDate: moment().format('YYYY-MM-DD'),
        fromTime: "00:00",
        toTime: "00:00"
      };

      var params = {
        groupBy: "day",
        from: moment($scope.fromDate).format('YYYY-MM-DD') + "T" + $scope.fromTime,
        to: moment($scope.toDate).format('YYYY-MM-DD') + "T" + $scope.toTime,
        tz: profile.data.timezone
      };
      $scope.summary = {};
      Report.get(angular.copy(params), function (result) {
        $scope.summary = result.data.totals;
        feedChartData(result.data.rows);
      });

      $scope.order = 'desc';
      $scope.sortby = 'profit';

      $scope.$watch(function () {
        return [$scope.order, $scope.sortby];
      }, getTableData, true);

      $scope.tableData = {};

      $scope.tables = ['campaign', 'Country'];

      params.limit = 5;
      params.page = 1;
      function getTableData() {
        if ($scope.order == 'desc') {
          params.order = '-' + $scope.sortby;
        } else {
          params.order = $scope.sortby;
        }

        $scope.tables.forEach(function (tbl) {
          var p = angular.copy(params);
          p.groupBy = tbl;
          Report.get(p, function (result) {
            $scope.tableData[tbl] = result.data.rows;
          });
        });
      }

      $scope.$watch('datetype', function (newValue, oldValue) {
        if (angular.equals(newValue, oldValue)) {
          return;
        }
        getDateRange(newValue);
        params.from = $scope.fromDate + "T" + $scope.fromTime;
        params.to = $scope.toDate + "T" + $scope.toTime;

        getReportByDate(params);
      });

      $scope.$watch('filter', function (newValue, oldValue) {
        if (angular.equals(newValue, oldValue)) {
          return;
        }
        params.from = moment($scope.filter.fromDate).format('YYYY-MM-DD') + "T" + $scope.filter.fromTime;
        params.to = moment($scope.filter.toDate).format('YYYY-MM-DD') + "T" + $scope.filter.toTime;
        getReportByDate(params);

      }, true);
    });

    function feedChartData(datas) {
      $scope.chart = {
        datasetOverride: [{yAxisID: 'y-axis-1'}],
        options: {
          responsive: true,
          legend: {
            display: true,
            position: 'top'
          },
          scales: {
            xAxes: [{
              display: true,
              gridLines: {
                display: false
              }
            }],
            yAxes: [{
              id: 'y-axis-1',
              type: 'linear',
              display: true,
              position: 'left',
              gridLines: {
                display: false
              }
            }]
          }
        }
      };

      var labels = [];
      var series = [];
      var dataset = [];
      var cols = ['visits', 'clicks', 'conversions', 'revenue', 'cost', 'profit', 'impressions'];
      cols.forEach(function (col) {
        var colName = $filter('translate')('dashboardColumn.' + col);
        series.push(colName);
      });

      datas.forEach(function (data) {
        labels.push(data.day);
        cols.forEach(function (col, idx) {
          if (dataset[idx]) {
            dataset[idx].push(data[col]);
          } else {
            dataset[idx] = [data[col]];
          }
        });
      });

      if (labels.length == 0) {
        labels = [$scope.fromDate, $scope.toDate];
      }
      if (dataset.length == 0) {
        dataset = [[0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0]];
      }

      $scope.chart.labels = labels;
      $scope.chart.series = series;
      $scope.chart.data = dataset;
    }

    function getReportByDate (params) {
      Report.get(angular.copy(params), function (result) {
        $scope.summary = result.data.totals;
        feedChartData(result.data.rows);
      });

      $scope.tables.forEach(function (tbl) {
        var p = angular.copy(params);
        p.groupBy = tbl;
        Report.get(p, function (result) {
          $scope.tableData[tbl] = result.data.rows;
        });
      });
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
        case '9':
          fromDate = moment().startOf('year').format('YYYY-MM-DD');
          break;
        case '10':
          fromDate = moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD');
          toDate = moment().startOf('year').format('YYYY-MM-DD');
          break;
      }
      $scope.fromDate = fromDate;
      $scope.toDate = toDate;
    }

  }


})();
