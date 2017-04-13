(function () {
    'use strict';

    angular.module('app')
        .controller('InvoicesCtrl', [
            '$scope', 'toastr', '$mdDialog', 'Invoices', 'Payments', 'BillingInfo', 'Paypal',
            InvoicesCtrl
        ]);

    function InvoicesCtrl($scope, toastr, $mdDialog, Invoices, Payments, BillingInfo, Paypal) {
        $scope.app.subtitle = 'Invoices';

        Invoices.get(null, function(user){
        	$scope.item = user.data;
        });

        Payments.get(null, function(user){
        	$scope.pItem = user.data;
        });

        $scope.query = {
        	page:1,
        	order:'date'
        };
		$scope.$watch('query', function(newVal, oldVal) {
			if (angular.equals(newVal, oldVal)) {
				return;
			}
			if (oldVal && (newVal.order != oldVal.order ) && newVal.page > 1) {
				$scope.query.page = 1;
				return;
			}

			Payments.get($scope.query,function(user){
        		$scope.pItem = user.data;
        	});
		}, true);

		$scope.editInvoices = function(ev, item) {
			$mdDialog.show({
				bindToController: true,
				targetEvent: ev,
				clickOutsideToClose: false,
				controllerAs: 'ctrl',
				controller: ['$scope', 'toastr', '$mdDialog', 'BillingInfo', 'Paypal', editInvoicesCtrl],
				focusOnOpen: false,
				locals: {
					item: item
				},
				templateUrl: function() {
          return 'tpl/invoices-update-dialog.html?' + +new Date();
        }
			});
		};

    }

	function editInvoicesCtrl($scope, toastr, $mdDialog, BillingInfo, Paypal) {
    var self = this;
		this.title = 'Invoices';
		this.titleType = 'Update';
		this.cancel = $mdDialog.cancel;
    $scope.countries = $scope.$root.countries;

		BillingInfo.get(null, function(user){
	    	$scope.item = user.data;
	    });

		$scope.toPayPal = function (ev, item) {
      $scope.invoicesUpdateStatus = true;
			BillingInfo.save($scope.item,function(result){
                self.cancel();
                $scope.invoicesUpdateStatus = false;
			// 	$mdDialog.show({
			//         multiple: true,
			//         skipHide: true,
			//         clickOutsideToClose: false,
			//         controller: ['$scope', 'toastr', '$mdDialog', 'Paypal', editPayPalCtrl],
			//         controllerAs: 'ctrl',
			//         focusOnOpen: false,
			//         locals: { item: item},
			//         bindToController: true,
			//         targetEvent: ev,
			//         templateUrl: 'tpl/invoices-paypal-dialog.html',
		    //   });
			});

	    };



	}

	function editPayPalCtrl($scope, toastr, $mdDialog, Paypal){
		this.title = 'Invoices';
		this.titleType = 'PayPal';
		this.cancel = function() {
	      $mdDialog.cancel();
	    };

	    this.save = function(){
	    	Paypal.save($scope.item,function(result){
	    		if(result.status){
	    			toastr.success('PayPal save success!');
	    		}else{
	    			toastr.error('PayPal save error!');
	    		}
	    	});
	    };
	}
})();
