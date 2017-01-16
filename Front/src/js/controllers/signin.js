(function () {
    'use strict';

    angular.module('app')
        .controller('SigninCtrl', [
            '$scope', '$auth', '$state', 'toastr',
            SigninCtrl
        ]);

    function SigninCtrl($scope, $auth, $state, toastr) {
        $scope.app.subtitle = 'Sign in';
        $scope.user = {};
        $scope.login = function () {
            $auth.login($scope.user, {ignoreAuthModule: true})
                .then(function () {
                    $scope.$emit('event:auth-loginSuccess');
                    $state.go('app.report.campaign');
                })
                .catch(function (response) {
                    toastr.error(response.message, {timeOut: 7000, positionClass: 'toast-top-center'});
                });
        };
    }
})();
