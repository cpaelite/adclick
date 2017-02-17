(function () {
  'use strict';

  angular.module('app')
    .controller('SubscriptionsCtrl', [
      '$scope', 'Profile', 'Billing',
      SubscriptionsCtrl
    ]);

  function SubscriptionsCtrl($scope, Profile, Billing) {
    $scope.app.subtitle = 'Subscriptions';

    Profile.get(null, function (profile) {
      if (profile.data) {
        Billing.get({timezone: profile.data.timezone}, function (bill) {
          $scope.item = bill.data.activeSubscription;
        });
      }
    });

  }
})();
