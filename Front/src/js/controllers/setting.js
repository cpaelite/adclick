(function () {
    'use strict';

    angular.module('app')
        .controller('SettingCtrl', [
            '$scope', 
            SettingCtrl
        ]);

    function SettingCtrl($scope) {
        $scope.app.subtitle = 'Setting';
    }
})();
