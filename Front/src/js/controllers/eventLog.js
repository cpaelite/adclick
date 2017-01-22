(function () {
    'use strict';

    angular.module('app')
        .controller('EventLogCtrl', [
            '$scope', 
            EventLogCtrl
        ]);

    function EventLogCtrl($scope) {
        $scope.app.subtitle = 'Event Log';
    }
})();
