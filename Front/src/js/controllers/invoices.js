(function () {
    'use strict';

    angular.module('app')
        .controller('InvoicesCtrl', [
            '$scope', 
            InvoicesCtrl
        ]);

    function InvoicesCtrl($scope) {
        $scope.app.subtitle = 'Invoices';
    }
})();
