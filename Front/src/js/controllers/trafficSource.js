(function() {

  angular.module('app')
    .controller('TrafficSourceCtrl', [
        '$scope', '$mdDialog', '$timeout', 'TrafficSource',
        TrafficSourceCtrl
    ]);

function TrafficSourceCtrl($scope, $mdDialog, $timeout, TrafficSource) {
    $scope.app.subtitle = 'TrafficSource';

    $scope.query = {
        limit: '10',
        order: 'id',
        page: 1
    };

    $scope.filterOptions = {
        debounce: 500
    };

    function success(items) {
        $scope.items = items;
    }
    $scope.getList = function () {
        $scope.promise = TrafficSource.get($scope.query, success).$promise;
    };

    $scope.$watch('query.order', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.query.page = 1;
        }
        if(oldValue) {
            $scope.getList();
        }
    });

    $scope.search = function () {
        $scope.query = {
            limit: '10',
            order: 'id',
            page: 1,
            q: $scope.query.q
        };
        $scope.getList();
    };

    $scope.fab = [];
    var cacheToggle = [];
    $scope.toggleFab = function(idx, open) {
        $scope.fab[idx].isOpen = open;
        if (open) {
            cacheToggle[idx] = $timeout(function() {
                $scope.fab[idx].tooltipVisible = true;
            }, 600);
        } else {
            if (cacheToggle[idx]) {
                $timeout.cancel(cacheToggle[idx]);
                cacheToggle[idx] = null;
            }
            $scope.fab[idx].tooltipVisible = false;
        }
    };

    $scope.editItem = function (ev, item) {
        $mdDialog.show({
            clickOutsideToClose: false,
            controller: ['$scope', '$mdDialog', 'TrafficSource', editItemCtrl],
            controllerAs: 'ctrl',
            focusOnOpen: false,
            locals: { item: item, currentUser: $scope.currentUser },
            bindToController: true,
            targetEvent: ev,
            templateUrl: 'tpl/trafficSource-edit-dialog.html',
        }).then($scope.getList);
    };

    $scope.deleteItem = function (ev, item) {
        $mdDialog.show({
            clickOutsideToClose: true,
            controller: ['$mdDialog', 'TrafficSource', deleteCtrl],
            controllerAs: 'ctrl',
            focusOnOpen: false,
            targetEvent: ev,
            locals: { item: item },
            bindToController: true,
            templateUrl: 'tpl/delete-confirm-dialog.html',
        }).then($scope.getList);
    };

    $scope.data = [
        {name:'Traffic source'},
        {name:'Traffic source ID'},
        {name:'Impressions'},
        {name:'Visits'},
        {name:'Clicks'},
        {name:'Conversions'},
        {name:'Revenue'},
        {name:'Cost'},
        {name:'Profit'},
        {name:'CPV'},
        {name:'ICTR'},
        {name:'CTR'},
        {name:'CR'},
        {name:'CV'},
        {name:'ROI'},
        {name:'EPV'},
        {name:'EPC'},
        {name:'AP'},
        {name:'Errors'},
        {name:'Postback URL'},
        {name:'Click ID'},
        {name:'Cost argument'},
        {name:'Variable1'},
        {name:'Variable2'},
        {name:'Variable3'},
        {name:'Variable4'},
        {name:'Variable5'},
        {name:'Variable6'},
        {name:'Variable7'},
        {name:'Variable8'},
        {name:'Variable9'},
        {name:'Variable10'}

    ];
    $scope.viewColumnIsShow = false;
    $scope.viewColumnClick = function(){
        $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
    };

    $scope.viewCloumnClose = function(){
        $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
    };
}

function editItemCtrl($scope, $mdDialog, TrafficSource) {
    $scope.currentUser = angular.copy(this.currentUser);
    if (this.item) {
        $scope.item = angular.copy(this.item);
        this.title = "edit";
    } else {
        $scope.item = {
            costModel: 'Do not track costs',
            status: '0'
        };
        this.title = "add";
        $scope.urlToken = '';
    }
    this.cancel = $mdDialog.cancel;

    function success(item) {
        $mdDialog.hide(item);
    }

    this.save = function () {
        $scope.editForm.$setSubmitted();

        if ($scope.editForm.$valid) {
            TrafficSource.save($scope.item, success);
        }
    };

    $scope.urlItem = [
        "{campaign.id}",
        "{brand}",
        "{device}",
        "{trafficSource.name}",
        "{trafficSource.id}",
        "{lander.id}"
    ];
    $scope.urlTokenClick = function(url){
        $scope.urlToken = $scope.urlToken + url;
    };

    $scope.visible = false;
    $scope.toggleShow = function(){
        $scope.isActive = !$scope.isActive;
        $scope.visible = !$scope.visible;
    };

    $scope.selectTrafficSourceTemplate = function (ev, item) {
        $mdDialog.show({
            clickOutsideToClose: false,
            controller: ['$scope', '$mdDialog', selectTrafficSourceTemplateCtrl],
            controllerAs: 'ctrl',
            focusOnOpen: false,
            locals: { item: item, currentUser: $scope.currentUser },
            bindToController: true,
            targetEvent: ev,
            templateUrl: 'tpl/trafficSource-template-dialog.html',
        });
    };  

}

function selectTrafficSourceTemplateCtrl($scope, $mdDialog){
    this.cancel = $mdDialog.cancel;

    function success(item) {
        $mdDialog.hide(item);
    }

    this.save = function () {
        $scope.editForm.$setSubmitted();

        if ($scope.editForm.$valid) {
            selectTrafficSourceTemplate.save($scope.item, success);
        }
    };
}

function deleteCtrl($mdDialog, TrafficSource) {
    this.title = "delete";
    this.content = 'warnDelete';

    this.cancel = $mdDialog.cancel;

    function deleteItem(item) {
        var deferred = TrafficSource.remove({id: item.id});
        return deferred.$promise;
    }

    this.ok = function() {
        deleteItem(this.item).then(success, error);
    };

    function success() {
        console.log("success delete");
        $mdDialog.hide();
    }

    function error() {
        this.error = 'Error occured when delete.';
    }
}

})();
