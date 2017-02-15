(function () {
    'use strict';

    angular.module('app')
        .controller('ReferralProgramCtrl', [
            '$scope','$timeout', 'Referrals',
            ReferralProgramCtrl
        ]);

    function ReferralProgramCtrl($scope, $timeout, Referrals) {
        $scope.app.subtitle = 'Referral Program';

        Referrals.get({id: ''}, function(user) {
        	$scope.item = user.data;
        });

        $scope.btnWord = "Copy to clipboard";
		$scope.itemUrlClick = function() {
			$scope.btnWord = "Copied";
			$timeout(function() {
				$scope.btnWord = "Copy to clipboard";
			}, 2000);
		};
    }
})();
