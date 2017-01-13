(function() {

  angular.module('app')
    .controller('TrackCampaignCtrl', [
        '$scope', '$mdDialog', '$timeout', 'TrackCampaign',
        TrackCampaignCtrl
    ]);

    function TrackCampaignCtrl($scope, $mdDialog, $timeout, TrackCampaign) {
        $scope.app.subtitle = 'TrackCampaign';

        $scope.query = {
            limit: '10',
            offset: 0,
            sort: 'id',
            direction: 'des',
            groupBy: 'campaign'
        };

        $scope.datetype = 1;

        /*$scope.filterOptions = {
            debounce: 500
        };*/

        function success(result) {
            if (result.status == 1) {
                $scope.items.rows = result.data.rows;
                $scope.items.totals = result.data.totals;
            }
        }
        $scope.getList = function () {
            $scope.promise = TrackCampaign.get($scope.query, success).$promise;
        };

        $scope.$watch('datetype', function (newValue, oldValue) {
            if (newValue != oldValue && newValue != 0) {
                getDateRange(newValue);
                $scope.getList();
            }
        });

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
                controller: ['$scope', '$mdDialog', 'TrackCampaign', editItemCtrl],
                controllerAs: 'ctrl',
                focusOnOpen: false,
                locals: { item: item, currentUser: $scope.currentUser },
                bindToController: true,
                targetEvent: ev,
                templateUrl: 'tpl/trackCampaign-edit-dialog.html',
            }).then($scope.getList);
        };

        $scope.deleteItem = function (ev, item) {
            $mdDialog.show({
                clickOutsideToClose: true,
                controller: ['$mdDialog', 'TrackCampaign', deleteCtrl],
                controllerAs: 'ctrl',
                focusOnOpen: false,
                targetEvent: ev,
                locals: { item: item },
                bindToController: true,
                templateUrl: 'tpl/delete-confirm-dialog.html',
            }).then($scope.getList);
        };

        $scope.data = [
            {name:'Campaign'},
            {name:'Campaign ID'},
            {name:'Campaign URL'},
            {name:'Campaign country'},
            {name:'Impressions'},
            {name:'Visits'},
            {name:'Clicks'},
            {name:'Conversions'},
            {name:'Revenue'},
            {name:'Cost'},
            {name:'Profit'},
            {name:'CPV'},
            {name:'ICTR'}
        ];
        $scope.viewColumnIsShow = false;
        $scope.viewColumnClick = function(){
            $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
        };

        $scope.viewCloumnClose = function(){
            $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
        };

        function getDateRange(value) {
            var fromDate;
            var toDate;
            switch (value) {
                case '1':
                    fromDate = moment(new Date).subtract(1, 'days').format('YYYY-MM-DD');
                    toDate = moment(new Date).format('YYYY-MM-DD');
                    break;
                case '2':
                    fromDate = moment(new Date).subtract(6, 'days').format('YYYY-MM-DD');
                    toDate = moment(new Date).format('YYYY-MM-DD');
                    break;
                case '3':
                    fromDate = moment(new Date).subtract(13, 'days').format('YYYY-MM-DD');
                    toDate = moment(new Date).format('YYYY-MM-DD');
                    break;
                case '4':
                    fromDate = moment(new Date).day(1).format('YYYY-MM-DD');
                    toDate = moment(new Date).format('YYYY-MM-DD');
                    break;
                case '5':
                    fromDate = moment(new Date).day(-6).format('YYYY-MM-DD');
                    toDate = moment(new Date).day(0).format('YYYY-MM-DD');
                    break;
                case '6':
                    fromDate = moment(new Date).startOf('month').format('YYYY-MM-DD');
                    toDate = moment(new Date).format('YYYY-MM-DD');
                    break;
                case '7':
                    fromDate = moment(new Date).subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
                    toDate = moment(new Date).subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
                    break;
            }
            $scope.datetype = value;
            $scope.query = {
                from: fromDate,
                to: toDate
            }
        }

    }

    function editItemCtrl($scope, $mdDialog, TrackCampaign) {
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
                TrackCampaign.save($scope.item, success);
            }
        };

        var self = this;
        self.readonly = false;
        self.tags = [];
        self.newVeg = function(chip) {
          return {
            name: chip,
            type: 'unknown'
          };
        };

        $scope.visible = false;
        $scope.ztreeShow = false;
        $scope.toggleShow = function (type){
            if(type == '1'){
                $scope.visible = !$scope.visible;
                $scope.isActive = !$scope.isActive;
            }else{
                $scope.ztreeShow = !$scope.ztreeShow;
                $scope.isActive1 = !$scope.isActive1;
            }
        };

        $scope.typeRadio = false;
        $scope.radioSelect = function(type){
            $scope.typeRadio = true;
            $scope.radioTitle = type;
        };

        $scope.flowAction = true;
        $scope.urlTokenCon = false;
        $scope.destinationType = function (val){
            if(val =='1') {
                $scope.flowAction = false;
                $scope.urlTokenCon = true;
            }else if(val == '0'){
                $scope.flowAction = true;
                $scope.urlTokenCon = false;
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
        $scope.isDisabled = false;
        $scope.onChan
    }

    function deleteCtrl($mdDialog, TrackCampaign) {
        this.title = "delete";
        this.content = 'warnDelete';

        this.cancel = $mdDialog.cancel;

        function deleteItem(item) {
            var deferred = TrackCampaign.remove({id: item.id});
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
