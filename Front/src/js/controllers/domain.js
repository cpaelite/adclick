(function () {
    'use strict';

    angular.module('app')
        .controller('DomainCtrl', [
            '$scope', 
            DomainCtrl
        ]);

    function DomainCtrl($scope) {
        $scope.app.subtitle = 'Domain';

        $scope.isBtnColor = false;
        $scope.inputChange = function(){
        	console.log('111');
        	$scope.isBtnColor = !$scope.isBtnColor;
        };

    }
})();
