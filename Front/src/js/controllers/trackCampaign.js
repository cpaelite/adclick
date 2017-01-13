(function() {

  angular.module('app')
    .controller('TrackCampaignCtrl', [
        '$scope', '$mdDialog', '$timeout', 'TrackCampaign',
        TrackCampaignCtrl
    ]);

    angular.module('app').directive('tree', TrackCampaignDirective);

    function TrackCampaignCtrl($scope, $mdDialog, $timeout, TrackCampaign) {
        $scope.app.subtitle = 'TrackCampaign';

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
            $scope.promise = TrackCampaign.get($scope.query, success).$promise;
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

    }

    function TrackCampaignDirective() {
        return {
            require: '?ngModel',
            restrict: 'A',
            link: function($scope, element, attrs, ngModel) {
                var setting = {
                    data: {
                        simpleData: {  
                            enable: true  
                        } 
                    },
                    callback: {
                        onClick: function(event, treeId, treeNode, clickFlag) {
                            $scope.$apply(function() {
                                ngModel.$setViewValue(treeNode);
                            });
                        }
                    }
                };
 
                var zNodes = [
                    { name:"Path", open:true,
                        children: [
                            { name:"PathContent - 100(100%)",open:true,
                                children: [
                                    { name:"Lander",open:true,
                                        children:[
                                            {name:"LanderCon - 100(100%)"}
                                        ]   
                                    },
                                    { name:"Offers",open:true,
                                        children:[
                                            {name:"OffersCon - 100(100%)"}
                                        ]   
                                    }
                                ]
                            }
                        ]
                    }
                ];

                $.fn.zTree.init(element, setting, zNodes); 
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
