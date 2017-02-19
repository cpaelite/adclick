(function () {
    'use strict';

    angular.module('app')
        .controller('UserManagementCtrl', [
            '$scope', '$mdDialog', 'toastr', 'Member', 'Invitation',
            UserManagementCtrl
        ]);

    function UserManagementCtrl($scope, $mdDialog, toastr, Member, Invitation) {
        $scope.app.subtitle = 'UserManagement';

        Member.get(null,function(user){
        	$scope.item = user.data;
        });

        Invitation.get(null,function(user){
        	$scope.iItem = user.data;
        });
        
        $scope.sendInvitation = function(email){
        	Invitation.save({email:email},function(result){
        		$scope.iItem = result.data;
        		if(result.status){
                    toastr.success('invitations success!');
                }else{
                    toastr.error('invitations error!');
                }
        		$scope.email = '';
        	});
        };
        $scope.deleteInvitation = function(iItem, ev){
			$mdDialog.show({
				bindToController: true,
				targetEvent: ev,
				clickOutsideToClose: false,
				controllerAs: 'ctrl',
				controller: ['$scope', '$mdDialog', 'toastr', userDeleteCtrl],
				focusOnOpen: false,
				locals: {
					iItem: iItem
				},
				templateUrl: 'tpl/user-delete-dialog.html'
			}).then(function(){
				Invitation.delete({
					id: iItem.email
				}, function() {
					$scope.iItem['invitations'].splice(iItem, 1);
				});
			});
        	
        }
    }

    function userDeleteCtrl($scope, $mdDialog){
    	this.cancel = $mdDialog.cancel;
    	this.ok = function(){
    		$mdDialog.hide();
    	};
    }
})();
