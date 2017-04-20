(function () {
  'use strict';

  angular.module('app')
    .controller('fraudFilterCtrl', [
      '$scope', '$mdDialog', '$auth', '$q', '$state', 'toastr', '$cookies',
      fraudFilterCtrl
    ]);

  function fraudFilterCtrl($scope,  $mdDialog, $auth, $q, $state, toastr, $cookies) {
    $scope.app.subtitle = 'Sudden Change';
    $scope.fromDate = $scope.fromDate || moment().format('YYYY-MM-DD');
    $scope.toDate = $scope.toDate || moment().add(1, 'days').format('YYYY-MM-DD');

    $scope.ths = [
      {name:'Rule Name'},
      {name:'Campaigns'},
      {name:'Automatic Action'},
      {name:'Frequerncy'},
      {name:'Using data from'}
    ];
    $scope.trs = [
      {
        name:'exclude',
        campaigns:'AvazuMdsp - Thailand - Cool Clip-mmatch-sj',
        action:'Exclude Inventory Apps/Sites',
        frequerncy:'Every 6 Hours',
        datafrom:'Last 6 Hours'
      },
      {
        name:'exclude',
        campaigns:'AvazuMdsp - Thailand - Cool Clip-mmatch-sj',
        action:'Exclude Inventory Apps/Sites',
        frequerncy:'Every 6 Hours',
        datafrom:'Last 6 Hours'
      }
    ];
    $scope.logs = [
      {
        time:'2017-04-19 06:01:01',
        name:'exclude sites'
      },
      {
        time:'2017-04-19 07:01:01',
        name:'exclude sites'
      }
    ];

    $scope.viewLogs = function(ev){
      $mdDialog.show({
        clickOutsideToClose: false,
        controller: ['$scope', '$mdDialog', ruleLogCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        // locals: {index: index, data: $scope.data},
        bindToController: true,
        targetEvent: ev,
        templateUrl: 'tpl/rule-log-dialog.html?' + +new Date()
      });
    };
  }

  function ruleLogCtrl($scope, $mdDialog){
    this.cancel = $mdDialog.cancel;
  }
})();
