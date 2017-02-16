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

        $scope.query = {
            page: 1,
            limit: 100,
            order:'userId'
        };

        $scope.$watch('query', function(newVal, oldVal) {
            if (!newVal || !newVal.limit) {
                return;
            }
            if (angular.equals(newVal, oldVal)) {
                return;
            }
            if (oldVal && (newVal.order != oldVal.order || newVal.limit != oldVal.limit) && newVal.page > 1) {
                $scope.query.page = 1;
                return;
            }

            Referrals.get($scope.query, function(user) {
                $scope.item = user.data;
            });
        }, true);
    }
})();
