(function () {
    'use strict';

    angular.module('app')
        .controller('UserManagementCtrl', [
            '$scope', 
            UserManagementCtrl
        ]);

    function UserManagementCtrl($scope) {
        $scope.app.subtitle = 'UserManagement';
    }
})();
