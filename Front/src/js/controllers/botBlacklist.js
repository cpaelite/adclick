(function () {
    'use strict';

    angular.module('app')
        .controller('BotBlacklistCtrl', [
            '$scope','$mdDialog', 
            BotBlacklistCtrl
        ]);

    function BotBlacklistCtrl($scope,$mdDialog) {
        $scope.app.subtitle = 'Bot BlacklistCtrl';

        $scope.editItem = function (ev,item) {
		      $mdDialog.show({
		        bindToController: true,
		        targetEvent: ev,
		        clickOutsideToClose: true,
		         controller: ['$scope', '$mdDialog', editItemCtrl],
            focusOnOpen: false,
            locals: { item: item, currentUser: $scope.currentUser },
            bindToController: true,
            targetEvent: ev,
		        templateUrl: 'tpl/botBlacklist-edit-dialog.html'
		      });
	    };
    }

		function editItemCtrl($scope, $mdDialog) {
		    $scope.currentUser = angular.copy(this.currentUser);
		    this.cancel = $mdDialog.cancel;

		    function success(item) {
		        $mdDialog.hide(item);
		    }
		}
})();
