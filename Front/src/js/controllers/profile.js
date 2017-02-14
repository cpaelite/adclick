(function () {
    'use strict';

    angular.module('app')
        .controller('ProfileCtrl', [
            '$scope', 'toastr', 'ProfileAccount', 'PasswordChange', 'EmailChange',
            ProfileCtrl
        ]);

    function ProfileCtrl($scope,toastr, ProfileAccount, PasswordChange, EmailChange) {
        $scope.app.subtitle = 'Setting';

        ProfileAccount.get({id: '1'}, function(user) {
        	$scope.accountItem = user.data;
        });
        $scope.phoneNumbr = /^[0-9]*$/ ;
        $scope.accountSave = function() {
        	ProfileAccount.save($scope.accountItem,function(){
                toastr.success('Your account data save success!');
            });
        };

        $scope.passwordUpdateSave = function(){
            PasswordChange.save($scope.passwordItem,function(){
                toastr.success('Password reset success!');
            });
        };

        EmailChange.get(function(user){
            $scope.emailItem = user.data;
        });
        $scope.emailUpdateSave = function(){
            EmailChange.save($scope.emailItem,function(){
                toastr.success('Email reset success!');
            });
        };
    }
})();
