(function() {

  angular.module('app')
    .controller('DashCtrl', [
        '$scope', '$timeout', 'Report',
        DashCtrl
    ]);

function DashCtrl($scope, $timeout, Report) {
    $scope.app.subtitle = 'DashBoard';

    var params = {
      groupBy: "",
      from: moment().subtract(6, 'days').format('YYYY-MM-DD'),
      to: moment().format('YYYY-MM-DD')
    };
    $scope.summary = {};
    Report.get(angular.copy(params), function(result) {
      $scope.summary = result.data.totals;
    });

    $scope.order = 'desc';
    $scope.sortby = 'profit';

    $scope.$watch(function() { return [$scope.order, $scope.sortby]; }, getTableData, true);

    $scope.tableData = {};

    $scope.tables = ['campaign', 'country'];

    params.limit = 5;
    params.page = 1;
    function getTableData() {
      if ($scope.order == 'desc') {
        params.order = '-' + $scope.sortby;
      } else {
        params.order = $scope.sortby;
      }

      $scope.tables.forEach(function(tbl) {
        var p = angular.copy(params);
        p.groupBy = tbl;
        Report.get(p, function(result) {
          $scope.tableData[tbl] = result.data.rows;
        });
      });
    }

    function initChart() {
        // highcharts
        Highcharts.chart('container', {
            title: {
                text: '',
            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: ['15.Jan', '04:00', '08:00', '12:00', '16:00', '20:00']
            },
            yAxis: [{
                title: {
                    text: ''
                },
                max:1400,
                tickInterval:500
            }, {
                opposite: true,
                title: {
                    text: ''
                }
            }],
            series: [{
                data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0],
                name:'Visits'
            },{
                data: [2.9, 41.5, 16.4, 12.2, 184.0, 176.0],
                yAxis:1,
                name:'Clicks'
            },{
                data: [20.9, 81.5, 19.4, 2.2, 84.0, 76.0],
                yAxis:1,
                name:'Conversions'
            },{
                data: [23.9, 40.5, 160.4, 121.2, 134.0, 16.0],
                yAxis:1,
                name:'Revenue'
            },{
                data: [27.9, 40.5, 19.4, 15.2, 104.0, 76.0],
                yAxis:1,
                name:'Cost'
            },{
                data: [22.9, 40.5, 26.4, 121.2, 0, 106.0],
                yAxis:1,
                name:'Profit'
            },{
                data: [26.9, 31.5, 36.4, 32.2, 14.0, 116.0],
                yAxis:1,
                name:'Impressions'
            }]
        });
    }

    $timeout(function() {
        initChart();
    });
}



})();
