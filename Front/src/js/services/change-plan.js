(function() {
  'use strict';

  angular.module('app').factory('ChangePlan', ['$rootScope', '$mdDialog', 'Profile', 'Billing', 'Plans', 'BillingInfo', 'Group', changePlan]);

  function changePlan($rootScope, $mdDialog, Profile, Billing, Plans, BillingInfo, Group) {
    return {
      showDialog: showDialog,
      hideDialog: hideDialog
    }

    function showDialog(planId, noPlan, afterCancel, options) {
      var $scope = $rootScope.$new()
      $mdDialog.show({
        bindToController: true,
        clickOutsideToClose: false,
        controllerAs: 'ctrl',
        controller: ['$scope', '$rootScope', '$mdDialog', 'Profile', 'Billing', 'Plans', 'BillingInfo', 'Group', changePlanCtrl],
        focusOnOpen: false,
        locals: {
          planId: planId,
          afterCancel: afterCancel,
          noPlan: noPlan,
          options: options
        },
        templateUrl: 'tpl/change-paln-dialog.html',
        escapeToClose: false
      });

      function changePlanCtrl($scope, $rootScope, $mdDialog, Profile, Billing, Plans, BillingInfo, Group) {
        var self = this;
        var proMoreEvents = 0.00004;
        var agencyMoreEvents = 0.000036;
        var superMoreEvents = 0.00003;
        var noobiePrice = 0;
        var proPrice = 99;
        var agencyPrice = 399;
        var superPrice = 999;
        Plans.get(null,function(plans){
          $scope.item = plans.data;
        });
        Group.get(null, function (result) {
          if (!result.status)
            return;
          $scope.groups = result.data.groups;
        });
        $scope.planId = this.planId ? this.planId : -1;
        $scope.noPlan = this.noPlan;
        $scope.upgrade = this.options ? this.options.upgrade : false;
        $scope.groups = $rootScope.groups;
        $scope.changeGroup = function(group) {
          $rootScope.changeGroup(group);
        }
        this.cancel = function () {
          self.afterCancel();
          $mdDialog.cancel();
        }
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
          prepayCost: 99,
          includedEvents: 10000000,
          totalCost: 99,
          overagesCost: 0,
          overagesEvents: 0,
          plan: 'PRO'
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
        $scope.editChangePlan = function(plan){
          $mdDialog.show({
            multiple: true,
            skipHide: true,
            clickOutsideToClose: false,
            controllerAs: 'ctrl',
            controller: ['$scope', '$mdDialog', 'Profile', 'Billing', 'Plans', 'BillingInfo', editChangePlanCtrl],
            focusOnOpen: false,
            locals: {
              plan:plan
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

      function editChangePlanCtrl($scope, $mdDialog, Profile, Billing, Plans, BillingInfo){
        var self = this;
        this.cancel = $mdDialog.cancel;

        BillingInfo.get(null,function(info){
          $scope.item = info.data;
        });

        Profile.get(null,function(user){
          $scope.userItem = user.data;
        });

        $scope.id = this.plan.id;
        $scope.btnStatus = false;
        $scope.planCommit = function(){
          $scope.btnStatus = true;
          Plans.save({'id': $scope.id},function(result){
            $scope.btnStatus = false;
            if(result.status){
              window.location.href = result.data;
            }
          });
        };
        $scope.desc = this.plan.desc;
      }
    }

    function hideDialog() {
      $mdDialog.hide();
    }
  }
})();
