(function () {
    'use strict';

    angular.module('app')
        .controller('ProfileCtrl', [
            '$scope', 
            ProfileCtrl
        ]);

    function ProfileCtrl($scope) {
        $scope.app.subtitle = 'Setting';
    }
})();
