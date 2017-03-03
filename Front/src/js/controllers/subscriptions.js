(function () {
  'use strict';

  angular.module('app')
    .controller('SubscriptionsCtrl', [
      '$scope', '$mdDialog', 'Profile', 'Billing', 'Plans', 'BillingInfo', '$location', 'toastr', 'Coupon', '$rootScope', 'ChangePlan',
      SubscriptionsCtrl
    ]);

  function SubscriptionsCtrl($scope, $mdDialog, Profile, Billing, Plans, BillingInfo, $location, toastr, Coupon, $rootScope, ChangePlan) {
    var paymessage = $location.$$search.message;
    $scope.app.subtitle = 'Subscriptions';

    if(paymessage === 'success') {
      toastr.success('pay success');
      $rootScope.changePlanStatus = false;
      ChangePlan.hideDialog();
    } else if (paymessage === 'cancel') {
      toastr.error('pay failed');
      $rootScope.changePlanStatus = true;
      ChangePlan.showDialog(-1, true);
    }

    function geteBillings() {
      Billing.get(null, function (bill) {
        $scope.item = bill.data;
      });
    }
    geteBillings();

    Plans.get(null, function(plans){
      $scope.plans = plans.data;
    });

    $scope.rootChangePlanStatus = $rootScope.changePlanStatus;
    $scope.changePlan = function(id) {
      ChangePlan.showDialog(id, false, function(){});
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
