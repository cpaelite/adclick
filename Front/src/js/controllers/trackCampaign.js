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
                    { id:1, pId:0, name:"Parents-1", open:true},
                    { id:11, pId:1, name:"Parents-11", open:true},
                    { id:111, pId:11, name:"Children-111"},
                    { id:112, pId:11, name:"Children-112"},
                    { id:113, pId:11, name:"Children-113"},
                    { id:114, pId:11, name:"Children-114"},
                    { id:12, pId:1, name:"Parents-12"},
                    { id:121, pId:12, name:"Children-121"},
                    { id:122, pId:12, name:"Children-122"},
                    { id:123, pId:12, name:"Children-123"},
                    { id:124, pId:12, name:"Children-124"},
                    { id:2, pId:0, name:"Parents-2"},
                    { id:21, pId:2, name:"Parents-21", open:true},
                    { id:211, pId:21, name:"Children-211"},
                    { id:212, pId:21, name:"Children-212"},
                    { id:213, pId:21, name:"Children-213"},
                    { id:214, pId:21, name:"Children-214"},
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
        $scope.isUrlBg = false;
        $scope.urlTokenClick = function(url){
            console.log(url);

            $scope.urlToken = $scope.urlToken + url;

        };

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
