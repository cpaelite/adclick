(function () {
    'use strict';

    angular.module('app')
        .controller('InvoicesCtrl', [
            '$scope', '$mdDialog',
            InvoicesCtrl
        ]);

    function InvoicesCtrl($scope, $mdDialog) {
        $scope.app.subtitle = 'Invoices';

		$scope.editInvoices = function(ev, item) {
			$mdDialog.show({
				bindToController: true,
				targetEvent: ev,
				clickOutsideToClose: false,
				controllerAs: 'ctrl',
				controller: ['$scope', '$mdDialog', editInvoicesCtrl],
				focusOnOpen: false,
				locals: {
					item: item
				},
				bindToController: true,
				templateUrl: 'tpl/invoices-update-dialog.html'
			});
		};

    }

	function editInvoicesCtrl($scope, $mdDialog) {
		this.title = 'Invoices';
		this.titleType = 'Update'
		this.cancel = $mdDialog.cancel;
		$scope.toPayPal = function (ev, item) {
		    $mdDialog.show({
		        multiple: true,
		        skipHide: true,
		        clickOutsideToClose: false,
		        controller: ['$scope', '$mdDialog', editPayPalCtrl],
		        controllerAs: 'ctrl',
		        focusOnOpen: false,
		        locals: { item: item},
		        bindToController: true,
		        targetEvent: ev,
		        templateUrl: 'tpl/invoices-paypal-dialog.html',
		      });
	    };
	}

	function editPayPalCtrl($scope, $mdDialog){
		this.title = 'Invoices';
		this.titleType = 'PayPal';
		this.cancel = function() {
	      $mdDialog.cancel();
	    };
	}
})();
