(function () {
  'use strict';

  angular.module('app')
    .controller('ReferralProgramCtrl', [
      '$scope', '$timeout', 'Profile', 'Referrals',
      ReferralProgramCtrl
    ]);

  function ReferralProgramCtrl($scope, $timeout, Profile, Referrals) {
    $scope.app.subtitle = 'Referral Program';

    Profile.get(null, function (profile) {
      var profile = profile.data;
      $scope.linkurl = "http://beta.newbidder.com/#/access/signup?refToken=" + profile.referralToken;
    });

    $scope.query = {
      page: 1,
      limit: 100,
      order: 'userId'
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
