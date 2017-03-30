(function () {
  'use strict';

  angular.module('app').controller('TsOfferReportCtrl', ['$scope', '$q', '$mdDialog', 'AffiliateTemplate', 'ThirdAffiliate', 'ThirdOffer', 'OfferTask', '$timeout', 'OfferImport', 'AffiliateNetwork', TsOfferReportCtrl]);

  function TsOfferReportCtrl($scope, $q, $mdDialog, AffiliateTemplate, ThirdAffiliate, ThirdOffer, OfferTask, $timeout, OfferImport, AffiliateNetwork) {
    $scope.thirdAffiliateId = '';
    $scope.taskId = '';
    $scope.query = {
      page: 1,
      limit: 100,
      __tk: 0
    };

    $scope.$watch('query', function (newVal, oldVal) {
      if (!newVal || !newVal.limit) {
        return;
      }
      if (angular.equals(newVal, oldVal)) {
        return;
      }
      if (oldVal && (newVal.order != oldVal.order || newVal.limit != oldVal.limit) && newVal.page > 1) {
        $scope.query.page = 1;
        return;
      }

      getThirdOffers();
    }, true);

    var initPromises = [], prms;

    // 获取第三方Offer
    function getThirdOffers() {
      var params = {};
      angular.extend(params, $scope.query, {taskId: $scope.taskId});
      delete params.__tk;
      $scope.promise = ThirdOffer.get(params, function(oData) {
        $scope.offers = oData.data;
      }).$promise;
    }

    var thirdAffiliatesMap = {};
    var affiliateTemplateMap = {};
    var affiliateNetworkMap = {};
    // 获取新建的第三方连接 getThirdAffiliates
    prms = ThirdAffiliate.get(null, function(oData) {
      $scope.thirdAffiliates = oData.data;
      oData.data.forEach(function(thirdAffiliate) {
        thirdAffiliatesMap[thirdAffiliate.id] = thirdAffiliate;
      });
    }).$promise;
    initPromises.push(prms);
    // 获取第三方AffiliateTemplate
    prms = AffiliateTemplate.get(null, function(oData) {
      $scope.affiliateTemplate = oData.data.lists;
      oData.data.lists.forEach(function(affiliateTemplate) {
        affiliateTemplateMap[affiliateTemplate.id] = affiliateTemplate;
      });
    }).$promise;
    initPromises.push(prms);

    prms = AffiliateNetwork.get(null, function(oData) {
      $scope.affiliateNetworks = oData.data.affiliates;
      oData.data.affiliates.forEach(function(affiliate) {
        affiliateNetworkMap[affiliate.id] = affiliate;
      });
      affiliateNetworkMap
    }).$promise;
    initPromises.push(prms);
    // 获取当前第三方连接的Task状态

    // 通过taskID拉去最新的Offer列表

    // 选取部分OFffer进行导入

    // 是否覆盖

    $q.all(initPromises).then(initSuccess);

    function initSuccess() {
      if($scope.thirdAffiliates.length > 0) {
        $scope.thirdAffiliateId = $scope.thirdAffiliates[0].id;
        checkOfferTask($scope.thirdAffiliateId);
      }
    }
    $scope.thirdAffiliateChanged = function(id) {
      $scope.taskId = '';
      checkOfferTask(id);
    };

    $scope.taskProgress = {};

    $scope.load = function() {
      $scope.taskProgress[$scope.thirdAffiliateId] = {
        offerStatus: false,
        progressStatus: true
      };
      OfferTask.save({thirdPartyANId: $scope.thirdAffiliateId}, function(oData) {
        if(oData.status == 1) {
          $scope.taskId = oData.data.taskId;
          checkOfferTask($scope.thirdAffiliateId);
        }
      });
    };

    function checkOfferTask(id) {
      if(!$scope.taskProgress[id]) {
        $scope.taskProgress[id] = {
          offerStatus: false,
          progressStatus: false
        };
      }
      if(!$scope.taskProgress[id].status) {
        $scope.taskProgress[id].status = false;
      }
      OfferTask.get({thirdPartyANId: id}, function(oData) {
        if(oData.status == 1 && oData.data.length > 0) {
          var data = oData.data[0];
          if(data.status == 0) {
            $scope.taskProgress[id].progressStatus = false;
          } else if (data.status == 1) { // runing
            $scope.taskProgress[id].progressStatus = true;
            if(!$scope.taskProgress[id].progress) {
              $scope.taskProgress[id].progress = Math.random()*100;
              loadOfferProgress(id);
            }
            $timeout(function() {
              checkOfferTask(id);
            }, 3000);
          } else if (data.status == 2) { // error
            $scope.taskProgress[id].progressStatus = false;
            if($scope.taskProgress[id].progress) {
              loadOfferProgress(id, true)
            }
          } else if (data.status == 3) { // Finish
            $scope.taskProgress[id].progressStatus = false;
            $scope.taskProgress[id].offerStatus = true;
            $scope.taskId = data.id;
            if($scope.taskProgress[id].progress) {
              loadOfferProgress(id, true)
            } else {
              // loader Offer
              getThirdOffers();
            }
          }
        } else if (oData.status == 1 && oData.data.length == 0) {
          $scope.taskProgress[id].offerStatus = true;
          $scope.offers = [];
        }
      });
    }

    function loadOfferProgress(id, isFinished) {
      if(isFinished) {
          $scope.taskProgress[id].progress = 100;
          // loader Offer
          getThirdOffers();
      } else {
        $timeout(function() {
          if($scope.taskProgress[id].progress < 90 && $scope.taskProgress[id].status == false) {
            $scope.taskProgress[id].progress = $scope.taskProgress[id].progress + (Math.random()/10);
            $scope.taskProgress[id].progressNum = new Number($scope.taskProgress[id].progress).toFixed(2);
            loadOfferProgress(id);
          }
        }, 100);
      }
    }

    $scope.importOffers = function(type) {
      $mdDialog.show({
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: ['$mdDialog', '$scope', 'OfferImport', importOffersCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {importType: type, affiliateNetworks: $scope.affiliateNetworks, affiliateNetworkMap: affiliateNetworkMap, taskId: $scope.taskId, selected: $scope.selected},
        templateUrl: 'tpl/import-offer-dialog.html'
      }).then(function() {

      });
    };

    function importOffersCtrl($mdDialog, $scope, OfferImport) {
      var params = {action: 1}, self = this;
      this.title = 'import offers';
      if(this.importType == 1) { // selected
        params.offers = this.selected;
      } else { // all
        params.taskId = this.taskId;
      }
      $scope.params = params;
      // affiliateNetworkMap
      $scope.params['affiliateName'] = this.affiliateNetworkMap[$scope.params.affiliateId];
      $scope.affiliateNetworks = this.affiliateNetworks;
      this.cancel = $mdDialog.cancel;
      this.onprocess = false;
      this.save = function() {
        self.onprocess = true;
        $scope.editForm.$setSubmitted();
        if($scope.editForm.$valid) {
          $scope.saveStatus = true;
          OfferImport.save($scope.params, function(oData) {
            // warning
            self.onprocess = false;
            $scope.saveStatus = false;
            if(oData.status == 1) {
              reImportWarn();
              self.error = oData.message || 'Error occured when import offers.';
            } else {
              $mdDialog.hide();
            }
          });
        }
      };
    }

    function reImportWarn() {
      $mdDialog.show({
        multiple: true,
        skipHide: true,
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: ['$mdDialog', '$scope', importOffersWarnCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {},
        templateUrl: 'tpl/close-confirm-dialog.html'
      }).then(function(oData) {
        // if(oData.type == 1){
        //
        // } else {
        // }
        $mdDialog.hide(oData);
      });
    }

    function importOffersWarnCtrl($mdDialog, $scope) {
      this.title = "warn";
      this.error = '1231231212';

      this.ok = function() {
        $mdDialog.hide();
      };

      this.cancel = function() {
        $mdDialog.hide();
      };
    }

    $scope.addOrEditThirdAffiliates = function(id) {
      var item = id ? angular.copy(thirdAffiliatesMap[id]) : '';
      var affiliateTemplateObject = item ? affiliateTemplateMap[item.affiliateId] : '';
      $mdDialog.show({
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: ['$mdDialog', '$scope', 'ThirdAffiliate', tsOfferCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {item: angular.copy(item), affiliateTemplate: $scope.affiliateTemplate, thirdAffiliates: $scope.thirdAffiliates, affiliateTemplateObject: affiliateTemplateObject},
        templateUrl: 'tpl/ts-offer-dialog.html'
      }).then(function() {
        ThirdAffiliate.get(null, function(oData) {
          $scope.thirdAffiliates = oData.data;
          oData.data.forEach(function(thirdAffiliate) {
            thirdAffiliatesMap[thirdAffiliate.id] = thirdAffiliate;
          });
        });
      });
    };

    function tsOfferCtrl($mdDialog, $scope, ThirdAffiliate) {
      var thirdAffiliates = this.thirdAffiliates;
      var self = this;
      this.title = this.item ? 'edit' : 'add';
      this.cancel = $mdDialog.cancel;
      if(this.item) {
        this.item.affiliateId = this.item.affiliateId.toString();
        this.item.id = this.item.id.toString();
        $scope.formData = this.item;
      }

      $scope.checkName = function(name, id) {
        $scope.editForm.name.$setValidity('checkName', !(thirdAffiliates.some(function(thirdAffiliate) {
          if(id && id == thirdAffiliate.id) {
            return false;
          }
          return thirdAffiliate.name == name;
        })));
      };

      $scope.affilateChanged = function(id) {
        $scope.affiliateTemplateObject = affiliateTemplateMap[id];
      };
      $scope.affiliateTemplates = this.affiliateTemplate;
      $scope.affiliateTemplateObject = this.affiliateTemplateObject;
      this.save = function() {
        $scope.editForm.$setSubmitted();
        if($scope.editForm.$valid) {
          $scope.saveStatus = true;
          if(self.item) {
            ThirdAffiliate.update({id: self.item.id}, $scope.formData, function(oData) {
              $mdDialog.hide();
              $scope.saveStatus = false;
            });
          } else {
            ThirdAffiliate.save($scope.formData, function(oData) {
              $mdDialog.hide();
              $scope.saveStatus = false;
            });
          }
        }
      };
    }

    $scope.offerDetail = function(id) {
      $mdDialog.show({
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: ['$mdDialog', '$scope', 'ThirdOffer', tsOfferDetail],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {id: id},
        templateUrl: 'tpl/ts-offer-detail-dialog.html'
      }).then(function() {

      })
    };

    function tsOfferDetail($mdDialog, $scope, ThirdOffer) {
      //var id = this.offerId;
      var id = 1;
      this.title = 'Detail';
      $scope.dataJson;
      this.cancel = $mdDialog.cancel;
      ThirdOffer.get({id: id}, function(result) {
        $scope.dataJson = result.data.offer;
      });
    }

    $scope.options = {
      rowSelection: true,
      multiSelect: true,
      autoSelect: true
    };

    $scope.selected = [];
  }
})();
