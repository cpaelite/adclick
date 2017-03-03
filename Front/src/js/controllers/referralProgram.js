(function () {
  'use strict';

  angular.module('app')
    .controller('ReferralProgramCtrl', [
      '$scope', '$timeout', 'Profile', 'Referrals', '$location',
      ReferralProgramCtrl
    ]);

  function ReferralProgramCtrl($scope, $timeout, Profile, Referrals, $location) {
    $scope.app.subtitle = 'Referral Program';

    Profile.get(null, function (profile) {
      var profile = profile.data;
      var domain = $location.$$absUrl.substring(0, $location.$$absUrl.indexOf('#')+1);
      $scope.linkurl = domain + "/access/signup?refToken=" + profile.referralToken;
    });

    $scope.query = {
      page: 1,
      limit: 100,
      order: 'referredUserId'
    };

    function success(item) {
      $scope.item = item.data;
    }

    $scope.getList = function () {
      $scope.promise = Referrals.get($scope.query, success).$promise;
    };

    $scope.btnWord = "Copy to clipboard";
    $scope.itemUrlClick = function () {
      $scope.btnWord = "Copied";
      $timeout(function () {
        $scope.btnWord = "Copy to clipboard";
      }, 2000);
    };

    $scope.$watch('query.order', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.query.page = 1;
      }
      if(oldValue) {
        $scope.getList();
      }
    });
  }
})();
