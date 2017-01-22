(function () {
    'use strict';

    angular.module('app')
        .controller('SignupCtrl', [
            '$scope', '$auth', '$state', 'toastr', 'AccountCheck', 'userPreferences',
            SignupCtrl
        ]);

    function SignupCtrl($scope, $auth, $state, toastr, AccountCheck, userPreferences) {
        $scope.app.subtitle = 'Sign up';
        $scope.user = {
            json: JSON.stringify(userPreferences)
        };
        $scope.signup = function () {
            $auth.signup($scope.user, { ignoreAuthModule: true })
                .then(function(response) {
                    $auth.setToken(response);
                    $state.go('access.signin', {});
                })
                .catch(function(response) {
                    toastr.error(response.data.message, { timeOut: 7000, positionClass: 'toast-top-center' });
                });
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
