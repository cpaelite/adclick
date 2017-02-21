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
    var proMoreEvents = 0.00004;
    var agencyMoreEvents = 0.000036;
    var superMoreEvents = 0.00003;
    var noobiePrice = 0;
    var proPrice = 99;
    var agencyPrice = 399;
    var superPrice = 999;

    this.cancel = $mdDialog.cancel;
    $scope.value = 1;
    $scope.inputValue = 1;
    $scope.options = {
      from: 1,
      to: 100000000,
      step: 1,
      round: 0,
      heterogeneity: ['33/1000000', '66/25000000'],
      limits: false,
      realtime: true,
      callback: function(value, elt) {
        calculateCosts(value);
        $scope.inputValue = $scope.value.toString().replace(/\B(?=(?:\d{3})+\b)/g, ',');
      }
    };
    $scope.bestPlan = {
      prepayCost: 0,
      includedEvents: 10000000,
      totalCost: 0,
      overagesCost: 0,
      overagesEvents: 0
    };

    $scope.valueChanged = function(val) {
      var val = val.replace(/,/g, '');
      if(!Number(val) && Number(val) != 0) {
        return;
      }
      if(val > 100000000) {
        val = $scope.value = 100000000;
      } else if (val < 1) {
        val = $scope.value = '';
      } else {
        $scope.value = val;
      }
      calculateCosts($scope.value);
      $scope.inputValue = val.toString().replace(/\B(?=(?:\d{3})+\b)/g, ',');
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

    function calculateSingleCost(val, eventsIncluded, standardCost, overageCost, plan) {
        var overagesEvents = (val - eventsIncluded);
        if (overagesEvents < 0) {
            overagesEvents = 0;
        }
        var overagesCost = overagesEvents * overageCost;

        return {
            totalCost: standardCost + overagesCost,
            overagesCost: overagesCost,
            prepayCost: standardCost,
            overagesEvents: overagesEvents,
            includedEvents: eventsIncluded,
            plan: plan
        };
    }

    function calculateCosts(val) {
      var costs = [
          calculateSingleCost(val, 1000000, proPrice, proMoreEvents, 'PRO'),
          calculateSingleCost(val, 10000000, agencyPrice, agencyMoreEvents, 'AGENCY'),
          calculateSingleCost(val, 30000000, superPrice, superMoreEvents, 'ENTERPRISE')
      ];

      var bestPlan = costs.reduce(function(prev, current) {
          return (prev.totalCost < current.totalCost) ? prev : current;
      });

      $scope.bestPlan = bestPlan;
    }
  }

  function editChangePlanCtrl($scope, $mdDialog, Profile, Billing){
    this.cancel = $mdDialog.cancel;
  }
})();
