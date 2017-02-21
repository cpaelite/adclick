(function () {
  'use strict';

  angular.module('app')
    .controller('SubscriptionsCtrl', [
      '$scope', '$mdDialog', 'Profile', 'Billing',
      SubscriptionsCtrl
    ]);

  function SubscriptionsCtrl($scope, $mdDialog, Profile, Billing) {
    $scope.app.subtitle = 'Subscriptions';

    Profile.get(null, function (profile) {
      if (profile.data) {
        Billing.get({timezone: profile.data.timezone}, function (bill) {
          $scope.item = bill.data.activeSubscription;
        });
      }
    });

    $scope.changePlan = function(ev, item){
      $mdDialog.show({
        bindToController: true,
        targetEvent: ev,
        clickOutsideToClose: false,
        controllerAs: 'ctrl',
        controller: ['$scope', '$mdDialog', 'Profile', 'Billing', changePlanCtrl],
        focusOnOpen: false,
        locals: {
          item: item
        },
        templateUrl: 'tpl/change-paln-dialog.html'
      });
    };
  }

  function changePlanCtrl($scope, $mdDialog, Profile, Billing){
    this.cancel = $mdDialog.cancel;

    $scope.value = 10;
    $scope.options = {
      from: 1,
      to: 100000000,
      round: 0,
      heterogeneity: ['33/1000000', '66/25000000'],
      limits: false,
      css: {
          background: {"background-color": "silver"},
          before: {"background-color": "purple"},// zone before default value
          default: {"background-color": "white"}, // default value: 1px
          after: {"background-color": "green"},  // zone after default value
          pointer: {"background-color": "red"},   // circle pointer
          range: {"background-color": "red"}, // use it if double value
      },
      callback: function(value, elt) {
          console.log(value);
      }
    };

    $scope.editChangePlan = function(ev,item){
      $mdDialog.show({
        multiple: true,
        skipHide: true,
        targetEvent: ev,
        clickOutsideToClose: false,
        controllerAs: 'ctrl',
        controller: ['$scope', '$mdDialog', 'Profile', 'Billing', editChangePlanCtrl],
        focusOnOpen: false,
        locals: {
          item: item
        },
        bindToController: true,
        templateUrl: 'tpl/edit-change-paln-dialog.html'
      });
    };
  }

  function editChangePlanCtrl($scope, $mdDialog, Profile, Billing){
    this.cancel = $mdDialog.cancel;
  }
})();
