(function () {
  'use strict';

  angular.module('app')
    .controller('DomainCtrl', [
      '$scope', '$mdDialog', 'toastr', 'Domains', 'DomainsValidatecname', '$q', 'Profile',
      DomainCtrl
    ]);

  function DomainCtrl($scope, $mdDialog, toastr, Domains, DomainsValidatecname, $q, Profile) {
    $scope.app.subtitle = 'Domain';

    $scope.isBtnColor = false;
    $scope.inputChange = function () {
      $scope.isBtnColor = !$scope.isBtnColor;
    };

    $scope.domainLimit = $scope.permissions.setting.domain.domainLimit;

    // init load data
    var initPromises = [], prms;

    var theDomains;
    prms = Domains.get(null, function (domain) {
      var domains = domain.data;
      if (domains.custom) {
        var alter = false;
        domains.custom.forEach(function (domain) {
          domain.btnName = "Verify DNS settings";
          if (domain.main && !domain.verified) {
            alter = true;
          }
        });
        if (alter) {
          toastr.clear();
          toastr.error('Main Domain CNAME validation Error!!!', {timeOut: 5000, positionClass: 'toast-top-center'});
        }
      }
      theDomains = domains;
    }).$promise;
    initPromises.push(prms);

    var profiles;
    prms = Profile.get(null, function (user) {
      profiles = user.data;
    }).$promise;
    initPromises.push(prms);

    function initSuccess() {
      $scope.item = angular.copy(theDomains);
      $scope.item.internal = $scope.item.internal.map(function(v) {
        v.address = profiles.idText + '.' + v.address;
        return v;
      });
      if ($scope.domainLimit ==  undefined || $scope.item['custom'].length >= $scope.domainLimit) {
        $scope.isGray = true;
      }
    }

    $q.all(initPromises).then(initSuccess);

    $scope.mainClick = function (l) {
      if (typeof(l.verified) != 'undefined' && !l.verified) {
        toastr.clear();
        toastr.error('Domain setup error, Please Verify DNS Setting', {timeOut: 2000, positionClass: 'toast-top-center'});
        return;
      }
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
      if ($scope.item['custom'].length < $scope.domainLimit) {
        $scope.item['custom'].push({
          address: '',
          main: false,
          btnName: "Verify DNS settings",
          verified: false
        });
      }
      if ($scope.item['custom'].length >= $scope.domainLimit) {
        $scope.isGray = true;
      }
    };

    $scope.deleteCustom = function ($index) {
      $scope.item['custom'].splice($index, 1);
      $scope.isGray = false;
    };

    $scope.domainSava = function () {
      var saveItem = angular.copy($scope.item);
      saveItem.internal = saveItem.internal.map(function(v, i) {
        v.address = theDomains.internal[i].address;
        return v;
      });
      if (saveItem.custom) {
        saveItem.custom.forEach(function (domain) {
          delete domain.btnName;
        });
      }

      $scope.domainSaveStatus = true;
      Domains.save(saveItem, function (result) {
        $scope.domainSaveStatus = false;
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
          domain.verified = true;
          domain.btnName = "Domain setup is OK";
        } else {
          domain.verified = false;
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
            templateUrl: function() {
              return 'tpl/domains-verify-dialog.html?' + +new Date();
            }
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
