(function () {
    'use strict';

    angular.module('app')
        .controller('SignupCtrl', [
            '$scope', '$auth', '$state', 'toastr', 'Signup', 'AccountCheck',
            SignupCtrl
        ]);

    function SignupCtrl($scope, $auth, $state, toastr, Signup, AccountCheck) {
        $scope.app.subtitle = 'Sign up';
        $scope.user = {};
        $scope.signup = function () {
            $scope.form.$setSubmitted();
            function success(response) {
                $auth.setToken(response);
                $state.go('access.signin', {name: response.data.item.name});
            }

            function error(response) {
                toastr.error(response.data.message, {timeOut: 7000, positionClass: 'toast-top-center'});
            }

            if ($scope.form.$valid) {
                Signup.save($scope.user, success, error);
            }
        };

        $scope.checkEmail = function () {
            function success(response) {
                if (response.data.exists) {
                    $scope.form.email.$setValidity('check', false);
                } else {
                    $scope.form.email.$setValidity('check', true);
                }
            }

            if ($scope.user.email) {
                AccountCheck.save({email: $scope.user.email}, success);
            }
        };
    }

})();
