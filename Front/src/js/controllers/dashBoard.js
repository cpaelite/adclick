(function() {

  angular.module('app')
    .controller('DashCtrl', [
        '$scope', '$mdDialog', '$timeout',
        DashCtrl
    ]);

function DashCtrl($scope, $mdDialog, $timeout) {
    $scope.app.subtitle = 'DashBoard';

    $scope.tableData = [
        {
            num:'',
            campaigns:'Campaigns',
            profit:'Profit',
            tbCon:[
                {id:1,content:'Popads - Viet Nam - mobisummer4-Cleaner-benson-0113',dollar:'$0.00'},
                {id:2,content:'Popads - Viet Nam - mobisummer4-Cleaner-benson-0113',dollar:'$0.00'},
                {id:3,content:'Popads - Viet Nam - mobisummer4-Cleaner-benson-0113',dollar:'$0.00'},
                {id:4,content:'Popads - Viet Nam - mobisummer4-Cleaner-benson-0113',dollar:'$0.00'},
                {id:5,content:'Popads - Viet Nam - mobisummer4-Cleaner-benson-0113',dollar:'$0.00'}
            ]
        },
        {
            num:'',
            campaigns:'Countries',
            profit:'Profit',
            tbCon:[
                {id:1,content:'Popads - Viet Nam - mobisummer4-Cleaner-benson-0113',dollar:'$0.00'},
                {id:2,content:'Popads - Viet Nam - mobisummer4-Cleaner-benson-0113',dollar:'$0.00'},
                {id:3,content:'Popads - Viet Nam - mobisummer4-Cleaner-benson-0113',dollar:'$0.00'},
                {id:4,content:'Popads - Viet Nam - mobisummer4-Cleaner-benson-0113',dollar:'$0.00'},
                {id:5,content:'Popads - Viet Nam - mobisummer4-Cleaner-benson-0113',dollar:'$0.00'}
            ]
        }
    ];

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



})();
