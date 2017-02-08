(function () {
    'use strict';

    angular.module('app')
        .controller('ProfileCtrl', [
            '$scope', 'User',
            ProfileCtrl
        ]);

    function ProfileCtrl($scope, User) {
        $scope.app.subtitle = 'Setting';
        User.get({id: '1'}, function(user) {
        	$scope.item = user.data;
        });

        // $scope.accountSave = function() {
        // 	User.save($scope.item);
        // };
        
        // input Tel 验证
	    // var regExp = {
	    // 	tel: /^1[34578]\d{9}$/ //手机号码
	    // };
	    //验证提示
		// var validate = $scope.validate = {};
		// validate.tel = " ";
		// $scope.validateAccountTel = function() {
		// 	if (regExp.tel.test(form.tel)) {
		// 		validate.tel = "";
		// 	} else if (form.tel.length > 0) {
		// 		validate.tel = "Phone number format is incorrect";
		// 	} else {
		// 		validate.tel = "Tel is required.";
		// 	}
		// };
        
    }
})();
