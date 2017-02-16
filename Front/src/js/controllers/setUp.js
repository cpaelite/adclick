(function () {
    'use strict';

    angular.module('app')
        .controller('SetUpCtrl', [
            '$scope', '$timeout', 'Setup',
            SetUpCtrl
        ]);

    function SetUpCtrl($scope, $timeout, Setup) {
        $scope.app.subtitle = 'SetUp';

		Setup.get({id: ''}, function(user) {
			$scope.item = user.data;
		});

		$scope.btn = {
			copy1:"Copy to clipboard",
			copy2:"Copy to clipboard",
			copy3:"Copy to clipboard",
			copy4:"Copy to clipboard",
			copy5:"Copy to clipboard",
			copy6:"Copy to clipboard",
			copy7:"Copy to clipboard"
		};
		$scope.itemUrlClick = function(copy) {
			$scope.btn[copy] = "Copied";
			$timeout(function() {
				$scope.btn[copy] = "Copy to clipboard";
			}, 2000);
		};
    }
})();
