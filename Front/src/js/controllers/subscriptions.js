(function () {
    'use strict';

    angular.module('app')
        .controller('SubscriptionsCtrl', [
            '$scope', 'Billing',
            SubscriptionsCtrl
        ]);

    function SubscriptionsCtrl($scope, Billing) {
        $scope.app.subtitle = 'Subscriptions';

		Billing.get({id: ''}, function(user) {
			$scope.item = user.data;
		});
    }
})();
