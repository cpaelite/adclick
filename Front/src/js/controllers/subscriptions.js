(function () {
  'use strict';

  angular.module('app')
    .controller('SubscriptionsCtrl', [
      '$scope', '$mdDialog', 'Profile', 'Billing', 'Plans', 'BillingInfo', '$location', 'toastr',
      SubscriptionsCtrl
    ]);

  function SubscriptionsCtrl($scope, $mdDialog, Profile, Billing, Plans, BillingInfo, $location, toastr) {
    $scope.app.subtitle = 'Subscriptions';

    Profile.get(null, function (profile) {
      if (profile.data) {
        Billing.get({timezone: profile.data.timezone}, function (bill) {
          $scope.item = bill.data;
        });
      }
    });

    var paymessage = $location.$$search.message;
    if(paymessage === 'success') {
      toastr.success('pay success');
    } else if (paymessage === 'cancel') {
      toastr.error('pay failed');
    }

    Plans.get(null,function(plans){
      $scope.plans = plans.data;
    });

    $scope.changePlan = function(status) {
      $scope.changePlanStatus = status;
    };
  }
})();
