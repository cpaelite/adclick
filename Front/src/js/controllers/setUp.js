(function () {
    'use strict';

    angular.module('app')
        .controller('SetUpCtrl', [
            '$scope', 
            SetUpCtrl
        ]);

    function SetUpCtrl($scope) {
        $scope.app.subtitle = 'SetUp';
    }
})();
