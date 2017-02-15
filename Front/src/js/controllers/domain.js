(function () {
    'use strict';

    angular.module('app')
        .controller('DomainCtrl', [
            '$scope', '$mdDialog', 'toastr', 'Domains', 'DomainsValidatecname',
            DomainCtrl
        ]);

    function DomainCtrl($scope, $mdDialog, toastr, Domains, DomainsValidatecname) {
        $scope.app.subtitle = 'Domain';

        $scope.isBtnColor = false;
        $scope.inputChange = function(){
        	$scope.isBtnColor = !$scope.isBtnColor;
        };

        Domains.get({id:''},function(user){
            $scope.item = user.data;
        });

        $scope.mainClick = function(l){
            $scope.item['internal'].forEach(function(v) {
                v.main = false;

            });
            $scope.item['custom'].forEach(function(v) {
                v.main = false;

            });
            l.main = true;
        };  

        $scope.isGray = false;
        $scope.addCustom = function(){
            if ($scope.item['custom'].length < 5) {
                $scope.item['custom'].push({
                    address: '',
                    main: false
                });
            }else if($scope.item['custom'].length == 5){
                $scope.isGray = true;
            }
        };

        $scope.deleteCustom = function($index){
            $scope.item['custom'].splice($index,1);
            $scope.isGray = false;
        };

        $scope.domainSava = function(){
            Domains.save($scope.item,function(result){
                if(result.status){
                    toastr.success('domain success!');
                }else{
                    toastr.error('domain error!');
                }
            });
        };

        $scope.domianVerifyBtn = "Verify DNS settings";
        $scope.isError = false;
        $scope.domainsVerify = function(ev, item){
            DomainsValidatecname.get({id:''},function(user){
                if(user.data.validateResult == 'NOT_FOUND'){
                    $scope.isError = true;
                    $scope.domianVerifyBtn = "Domain setup error";
                    $mdDialog.show({
                        bindToController: true,
                        targetEvent: ev,
                        clickOutsideToClose: false,
                        controllerAs: 'ctrl',
                        controller: ['$scope', '$mdDialog', 'toastr',domainVerifyCtrl],
                        focusOnOpen: false,
                        locals: {
                            item: item
                        },
                        bindToController: true,
                        templateUrl: 'tpl/domains-verify-dialog.html'
                    });
                }
            });
        };
    }

    function domainVerifyCtrl($scope, $mdDialog){
        this.cancel = $mdDialog.cancel;
    }
})();
