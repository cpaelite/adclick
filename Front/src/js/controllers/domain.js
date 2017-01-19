(function () {
    'use strict';

    angular.module('app')
        .controller('DomainCtrl', [
            '$scope', 
            DomainCtrl
        ]);

    function DomainCtrl($scope) {
        $scope.app.subtitle = 'Domain';
    }
})();
