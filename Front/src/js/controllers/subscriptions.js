(function () {
  'use strict';

  angular.module('app')
    .controller('SubscriptionsCtrl', [
      '$scope', '$mdDialog', 'Profile', 'Billing', 'Plans', 'Plan', 'BillingInfo', '$location', 'toastr', 'Coupon', '$rootScope', 'ChangePlan', '$q',
      SubscriptionsCtrl
    ]);

  function SubscriptionsCtrl($scope, $mdDialog, Profile, Billing, Plans, Plan, BillingInfo, $location, toastr, Coupon, $rootScope, ChangePlan, $q) {
    var paymessage = $location.$$search.message;
    $scope.app.subtitle = 'Subscriptions';

    // init load data
    var initPromises = [], prms;

    var theBillings;
    prms = Billing.get(null, function (bill) {
      theBillings = bill.data;
    }).$promise;
    initPromises.push(prms);

    var thePlan;
    prms = Plan.get(null, function (plan) {
      thePlan = plan.data.plan;
    }).$promise;
    initPromises.push(prms);

    var thePlans;
    prms = Plans.get(null, function(plans){
      thePlans = plans.data;
    }).$promise;
    initPromises.push(prms);

    $q.all(initPromises).then(initSuccess, function() {});

    function initSuccess() {
      $scope.item = theBillings;
      $scope.plans = thePlans;

      if(paymessage === 'success') {
        toastr.success('pay success');
        $rootScope.changePlanStatus = false;
        ChangePlan.hideDialog();
      } else if (paymessage === 'cancel') {
        toastr.error('pay failed');
        $rootScope.changePlanStatus = true;
        // ChangePlan.showDialog(-1, false, null, {level: -1});
      }
    }


    function geteBillings() {
      Billing.get(null, function (bill) {
        $scope.item = bill.data;
      });
    }

    $scope.rootChangePlanStatus = $rootScope.changePlanStatus;
    $scope.changePlan = function(id) {
      ChangePlan.showDialog(id, false, function(){}, {level: thePlan.level});
    };

    $scope.couponText = '';
    $scope.changeCoupon = function(code) {
      $scope.couponStatus = true;
      if(code) {
        Coupon.save({errorFn: true}, {code: code}, function(oData) {
          $scope.couponStatus = false;
          toastr.clear();
          $scope.couponText = '';
          if(oData.status == 1) {
            geteBillings();
            toastr.success(oData.message, {timeOut: 3000});
          } else {
            toastr.error(oData.message, {timeOut: 3000, positionClass: 'toast-top-center'});
          }
        });
      }
    };
  }
})();
