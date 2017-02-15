(function () {
    'use strict';

    angular.module('app')
        .controller('ProfileCtrl', [
            '$scope', 'toastr', 'Profile', 'Password', 'Email',
            ProfileCtrl
        ]);

    function ProfileCtrl($scope,toastr, Profile, Password, Email) {
        $scope.app.subtitle = 'Setting';

        Profile.get({id: ''}, function(user) {
        	$scope.accountItem = user.data;
        });
        $scope.phoneNumbr = /^[0-9]*$/ ;
        $scope.accountSave = function() {
        	Profile.save($scope.accountItem,function(){
                toastr.success('Your account data save success!');
            });
        };

        $scope.passwordUpdateSave = function(){
            Password.save($scope.passwordItem,function(result){
                if(result.status){
                    toastr.success('Password reset success!');
                }else{
                    toastr.error('old password error!');
                }
                
            });
        };

        Email.get(function(user){
            $scope.emailItem = user.data;
        });

        $scope.checkEmail = function () {
            function success(response) {
                if (response.data.exists) {
                    $scope.emailForm.email.$setValidity('check', false);
                } else {
                    $scope.emailForm.email.$setValidity('check', true);
                }
            }
        };

        $scope.emailUpdateSave = function(){
            Email.save($scope.emailItem,function(result){
                if(result.status){
                    toastr.success('Email reset success!');
                }else{
                    toastr.error('old password error!');
                }
                
            });
        };
    }
})();
