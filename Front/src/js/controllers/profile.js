(function () {
    'use strict';

    angular.module('app')
        .controller('ProfileCtrl', [
            '$scope', 'User','toastr',
            ProfileCtrl
        ]);

    function ProfileCtrl($scope, User, toastr) {
        $scope.app.subtitle = 'Setting';
        User.get({id: '1'}, function(user) {
        	$scope.item = user.data;
        });

        $scope.phoneNumbr = /^[0-9]*$/ ;

        $scope.accountSave = function() {
        	User.save($scope.item,function(){
                // console.log('111');
                toastr.success('Login success!');
            });
        };
    }
})();
