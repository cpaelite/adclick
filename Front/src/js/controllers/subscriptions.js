(function () {
    'use strict';

    angular.module('app')
        .controller('SubscriptionsCtrl', [
            '$scope', 
            SubscriptionsCtrl
        ]);

    function SubscriptionsCtrl($scope) {
        $scope.app.subtitle = 'Subscriptions';
    }
})();
