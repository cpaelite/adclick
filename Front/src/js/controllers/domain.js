(function () {
  'use strict';

  angular.module('app')
    .controller('DomainCtrl', [
      '$scope', '$mdDialog', 'toastr', 'Domains', 'DomainsValidatecname', 'Plan',
      DomainCtrl
    ]);

  function DomainCtrl($scope, $mdDialog, toastr, Domains, DomainsValidatecname, Plan) {
    $scope.app.subtitle = 'Domain';

    $scope.isBtnColor = false;
    $scope.inputChange = function () {
      $scope.isBtnColor = !$scope.isBtnColor;
    };

    Plan.get(null, function (plan) {
      $scope.plan = plan.data;
    });

    Domains.get(null, function (domain) {
      var domains = domain.data;
      if (domains.custom) {
        domains.custom.forEach(function (domain) {
            domain.btnName = "Verify DNS settings";
        });
      }
      $scope.item = domains;
    });

    $scope.mainClick = function (l) {
      $scope.item['internal'].forEach(function (v) {
        v.main = false;

      });
      $scope.item['custom'].forEach(function (v) {
        v.main = false;

      });
      l.main = true;
    };

    $scope.isGray = false;
    $scope.addCustom = function () {
      if ($scope.item['custom'].length < $scope.plan.domainLimit) {
        $scope.item['custom'].push({
          address: '',
          main: false,
          btnName: "Verify DNS settings"
        });
      }
      if ($scope.item['custom'].length == $scope.plan.domainLimit) {
        $scope.isGray = true;
      }
    };

    $scope.deleteCustom = function ($index) {
      $scope.item['custom'].splice($index, 1);
      $scope.isGray = false;
    };

    $scope.domainSava = function () {
      var saveItem = angular.copy($scope.item);
      if (saveItem.custom) {
        saveItem.custom.forEach(function (domain) {
          delete domain.btnName;
        });
      }
      Domains.save(saveItem, function (result) {
        if (result.status) {
          toastr.success('domain success!');
        } else {
          toastr.error(result.message);
        }
      });
    };

    $scope.domainsVerify = function (domain) {
      DomainsValidatecname.get({address: domain.address}, function (result) {
        if (result.status) {
          domain.btnName = "Domain setup is OK";
        } else {
          domain.btnName = "Domain setup error";
          $mdDialog.show({
            bindToController: true,
            clickOutsideToClose: false,
            controllerAs: 'ctrl',
            controller: ['$scope', '$mdDialog', domainVerifyCtrl],
            focusOnOpen: false,
            locals: {
              internal: $scope.item.internal,
              domainAddress: domain.address
            },
            templateUrl: 'tpl/domains-verify-dialog.html'
          });
        }
      });
    };
  }

  function domainVerifyCtrl($scope, $mdDialog) {
    this.cancel = $mdDialog.cancel;
    $scope.internals = this.internal;
    $scope.address = this.domainAddress;
  }
})();
