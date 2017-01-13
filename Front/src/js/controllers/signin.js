(function () {
    'use strict';

    angular.module('app')
        .controller('SigninCtrl', [
            '$scope', '$auth', '$state', 'toastr', 'Signin',
            SigninCtrl
        ]);

    function SigninCtrl($scope, $auth, $state, toastr, Signin) {
        $scope.app.subtitle = 'Sign in';
        $scope.user = {};
        $scope.login = function () {
            $scope.form.$setSubmitted();
            function success(response) {
                console.log("signin success");
                $auth.setToken(response);
                $scope.$emit('event:auth-loginSuccess');
                $state.go('app.affiliatenetwork');
            }

            function error(response) {
                toastr.error(response.data.message, {timeOut: 7000, positionClass: 'toast-top-center'});
            }

            if ($scope.form.$valid) {
                Signin.save($scope.user, success, error);
            }
        };
    }
})();
