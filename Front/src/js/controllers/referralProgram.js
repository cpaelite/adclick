(function () {
    'use strict';

    angular.module('app')
        .controller('ReferralProgramCtrl', [
            '$scope', 
            ReferralProgramCtrl
        ]);

    function ReferralProgramCtrl($scope) {
        $scope.app.subtitle = 'Referral Program';
    }
})();
