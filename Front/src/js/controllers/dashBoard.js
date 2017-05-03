(function () {

  angular.module('app')
    .controller('DashCtrl', [
      '$scope', '$filter', '$localStorage', 'Report', 'Profile', 'DateRangeUtil',
      DashCtrl
    ]);

  function DashCtrl($scope, $filter, $localStorage, Report, Profile, DateRangeUtil) {
    $scope.app.subtitle = 'DashBoard';

    $scope.datetype = $localStorage.reportDate.datetype;
    $scope.fromTime = $localStorage.reportDate.fromTime;
    $scope.toTime = $localStorage.reportDate.toTime;
    Profile.get(null, function (profile) {
      $scope.hours = [];
      for (var i = 0; i < 24; ++i) {
        if (i < 10) {
          $scope.hours.push('0' + i + ':00');
        } else {
          $scope.hours.push('' + i + ':00');
        }
      }

      getDateRange($scope.datetype, profile.data.timezone);

      $scope.filter = {
        fromDate: $localStorage.reportDate.fromDate,
        toDate: $localStorage.reportDate.toDate,
        fromTime: $scope.fromTime,
        toTime: $scope.toTime
      };

      var params = {
        order: "day",
        groupBy: "day",
        from: $scope.fromDate + "T" + $scope.fromTime,
        to: $scope.toDate + "T" + $scope.toTime,
        tz: profile.data.timezone,
        status: 1
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

      $scope.tables = ['campaign', 'country'];


      $scope.goGroupByOffer = function(type,val){
          if(type == 'campaign'){
            var params = {
              datatype:$scope.datetype,
              filters:{
                campaign: val.campaignId
              }
            }
            $scope.$state.go('app.report.offer',params);
          }
      };

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
            var rowsLen = result.data.rows.length;
            if(rowsLen == 0) {
              for(var i = 0; i < 5; i++) {
                $scope.tableData[tbl].push({});
              }
            } else if (rowsLen < 5){
              for(var i = 0; i < (5 - rowsLen); i++) {
                $scope.tableData[tbl].push({});
              }
            }
          });
        });
      }

      $scope.$watch('datetype', function (newValue, oldValue) {
        if (angular.equals(newValue, oldValue)) {
          return;
        }
        getDateRange(newValue, params.tz);
        params.from = $scope.fromDate + "T" + $scope.fromTime;
        params.to = $scope.toDate + "T" + $scope.toTime;

        fillLocalReportDate(newValue, $scope.fromDate, $scope.fromTime, $scope.toDate, $scope.toTime);

        getReportByDate(params);
      });

      $scope.$watch('filter', function (newValue, oldValue) {
        if (angular.equals(newValue, oldValue)) {
          return;
        }
        params.from = moment($scope.filter.fromDate).format('YYYY-MM-DD') + "T" + $scope.filter.fromTime;
        params.to = moment($scope.filter.toDate).format('YYYY-MM-DD') + "T" + $scope.filter.toTime;

        fillLocalReportDate($scope.datetype, moment($scope.filter.fromDate).format('YYYY-MM-DD'), $scope.filter.fromTime, moment($scope.filter.toDate).format('YYYY-MM-DD'), $scope.filter.toTime);

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
        $scope.tableData[tbl] = null;
        Report.get(p, function (result) {
          $scope.tableData[tbl] = result.data.rows;
          var rowsLen = result.data.rows.length;
          if(rowsLen == 0) {
            for(var i = 0; i < 5; i++) {
              $scope.tableData[tbl].push({});
            }
          } else if (rowsLen < 5){
            for(var i = 0; i < (5 - rowsLen); i++) {
              $scope.tableData[tbl].push({});
            }
          }
        });
      });
    }

    function getDateRange(value, timezone) {
      $scope.fromDate = DateRangeUtil.fromDate(value, timezone);
      $scope.toDate = DateRangeUtil.toDate(value, timezone);
    }

    function fillLocalReportDate(dateType, fromDate, fromTime, toDate, toTime) {
      $localStorage.reportDate.datetype = dateType;
      $localStorage.reportDate.fromDate = fromDate;
      $localStorage.reportDate.fromTime = fromTime;
      $localStorage.reportDate.toDate = toDate;
      $localStorage.reportDate.toTime = toTime;
    }

  }


})();
