(function () {
  'use strict';

  angular.module('app')
    .controller('TsOfferReportCtrl', ['$scope', '$q', '$mdDialog', 'AffiliateTemplate', 'ThirdAffiliate', 'ThirdOffer', 'OfferTask', '$timeout', 'OfferImport', 'AffiliateNetwork', TsOfferReportCtrl])
    .directive('resizets',['$timeout','$q',function($timeout,$q){
      return function(scope, element) {
        var timeout;
        var w_h = $(window);
        var nav_h = $('nav');
        var filter_h = $('.cs-action-bar-bg');
        var page_h = $('md-table-pagination');
        function getHeight() {
          var deferred = $q.defer();
          $timeout(function() {
            deferred.resolve({
              'w_h': w_h.height(),
              'nav_h': nav_h.height(),
              'filter_h':filter_h.outerHeight(true),
              'page_h':page_h.height()
            });
          });
          return deferred.promise;
        }

        function heightResize() {
          getHeight().then(function(newVal) {
            scope.windowHeight = newVal.w_h;
            scope.navHeight = newVal.nav_h;
            scope.filterHeight = newVal.filter_h;
            scope.pageHeight = newVal.page_h;
            angular.element(element).css({
              'height': (scope.windowHeight - 46 - scope.navHeight - scope.filterHeight - 56 - 33 - 5) + 'px'
            })
          })
        }

        heightResize();

        w_h.bind('resize', function() {
          heightResize();
        });
      }
    }]);

  function TsOfferReportCtrl($scope, $q, $mdDialog, AffiliateTemplate, ThirdAffiliate, ThirdOffer, OfferTask, $timeout, OfferImport, AffiliateNetwork) {
    $scope.app.subtitle = 'Network Offers';
    $scope.thirdAffiliateId = '';
    $scope.taskId = '';
    $scope.query = {
      page: 1,
      limit: 50,
      __tk: 0
    };
    $scope.type = 0;

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

    var offersMap;
    var selectOffers = [];
    // 获取第三方Offer
    function getThirdOffers() {
      var params = {};
      angular.extend(params, $scope.query, {taskId: $scope.taskId});
      delete params.__tk;
      $scope.promise = ThirdOffer.get(params, function(oData) {
        if(oData.status == 1) {
          $scope.offers = oData.data;
          offersMap = {}
          oData.data.rows.forEach(function(offer) {
            offersMap[offer.id] = offer
          });
        }
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
    prms = AffiliateTemplate.get({support: true}, function(oData) {
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
      $scope.thirdAffiliateId = id;
      $scope.filterValue = "";
      $scope.offers = {};
      checkOfferTask(id);
    };

    $scope.taskProgress = {};

    $scope.load = function() {
      $scope.offers = {rows: [], totalRows: 0};
      $scope.taskProgress[$scope.thirdAffiliateId] = {
        offerStatus: false,
        progressStatus: true
      };
      OfferTask.save({thirdPartyANId: $scope.thirdAffiliateId}, function(oData) {
        if(oData.status == 1) {
          $scope.taskId = oData.data.id;
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
          if(data.status == 0 || data.status == 1) { // create or running
            $scope.taskProgress[id].progressStatus = true;
            if(!$scope.taskProgress[id].progress) {
              $scope.taskProgress[id].progress = Math.random()*40 + 10;
              loadOfferProgress(id);
            }
            $timeout(function() {
              if($scope.thirdAffiliateId == id) {
                checkOfferTask(id);
              }
            }, 3000);
          } else if (data.status == 2) { // error
            $scope.taskProgress[id].progressStatus = false;
            $scope.taskProgress[id].taskErrorMeg = data.message;
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
              // getThirdOffers();
              $scope.query.page = 1;
              $scope.query.__tk++;
            }
          }
        } else if (oData.status == 1 && oData.data.length == 0) {
          $scope.taskProgress[id].offerStatus = true;
          $scope.offers = {rows: [], totalRows: 0};
        }
      });
    }

    function loadOfferProgress(id, isFinished) {
      if(isFinished) {
          $scope.taskProgress[id].progress = 100;
          $scope.taskProgress[id].progressNum = 100;
          $scope.query.page = 1;
          $scope.query.__tk++;
      } else {
        $timeout(function() {
          if($scope.taskProgress[id].progress < 80 && $scope.taskProgress[id].status == false) {
            $scope.taskProgress[id].progress = $scope.taskProgress[id].progress + (Math.random()/10);
            $scope.taskProgress[id].progressNum = new Number($scope.taskProgress[id].progress).toFixed(2);
            loadOfferProgress(id);
          } else if($scope.taskProgress[id].progress <= 98 && $scope.taskProgress[id].progress >= 80 && $scope.taskProgress[id].status == false) {
            $scope.taskProgress[id].progress = $scope.taskProgress[id].progress + (Math.random()/100);
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
        templateUrl: 'tpl/import-offer-dialog.html?' + +new Date()
      }).then(function(selectOffer) {
        $scope.selected = [];
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
      $scope.affiliateNetworks = this.affiliateNetworks;
      this.cancel = $mdDialog.cancel;
      this.onprocess = false;
      this.save = function() {
        $scope.params['affiliateName'] = self.affiliateNetworkMap[$scope.params.affiliateId].name;
        self.onprocess = true;
        $scope.editForm.$setSubmitted();
        if($scope.editForm.$valid) {
          $scope.saveStatus = true;
          OfferImport.save({errorFn: true}, $scope.params, function(oData) {
            // warning
            self.onprocess = false;
            $scope.saveStatus = false;
            if(oData.status == 0) {
              // self.error = oData.message || 'Error occured when import offers.';
              reImportWarn(oData, $scope.params, self.selected);
            } else {
              $mdDialog.hide(self.selected);
            }
          });
        }
      };
    }

    function reImportWarn(oData, params, selected) {
      $mdDialog.show({
        multiple: true,
        skipHide: true,
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: ['$mdDialog', '$scope', 'OfferImport', importOffersWarnCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {oData: oData, params: params},
        templateUrl: 'tpl/warn-dialog.html?' + +new Date()
      }).then(function(oData) {
        $mdDialog.hide(selected);
      });
    }

    function importOffersWarnCtrl($mdDialog, $scope, OfferImport) {
      var self = this, len = this.oData.data.offers ? this.oData.data.offers.length : 0;
      this.title = "warn";
      this.error = len > 0 ? (len == 1 ? 'The offer exist when import, do you want to replace it.' : 'Some offers exist when import, do you want to replace them.') : this.oData.message;
      $scope.warnSaveStatus = true;
      this.ok = function() {
        $scope.warnSaveStatus = false;
        if(len > 0) {
          OfferImport.save({errorFn: true}, {action: 2, affiliateId: self.params.affiliateId, affiliateName: self.params.affiliateName, offers: self.oData.data.offers}, function(oData) {
            $scope.warnSaveStatus = true;
            if(oData.status == 1) {
              $mdDialog.hide();
            } else {
              self.error = oData.message;
            }
          });
        } else {
          $mdDialog.hide();
        }
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
        templateUrl: 'tpl/ts-offer-dialog.html?' + +new Date()
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

    $scope.itemUrlClick = function(offer, key){
      if(!offer[key]) {offer[key] = {};}
      offer[key].btnWord = "Copied";
      $timeout(function() {
        offer[key].btnWord = "Clipboard";
      }, 1000);
    };

    $scope.offerDetail = function(offer) {
      $mdDialog.show({
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: ['$mdDialog', '$scope', 'ThirdOffer', tsOfferDetail],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {offer: offer},
        templateUrl: 'tpl/ts-offer-detail-dialog.html?' + +new Date()
      }).then(function() {

      })
    };

    function tsOfferDetail($mdDialog, $scope, ThirdOffer) {
      $scope.item = this.offer;
      this.title = 'Detail';
      $scope.dataJson;
      this.cancel = $mdDialog.cancel;
      ThirdOffer.get({id: $scope.item.id}, function(result) {
        $scope.dataJson = result.data;
      });

      $scope.visible = false;
      $scope.toggleShow = function(){
        $scope.isActive = !$scope.isActive;
        $scope.visible = !$scope.visible;
      };

      $scope.btnWord = "Clipboard";
      $scope.itemUrlClick = function(){
        $scope.btnWord = "Copied";
        $timeout(function() {
          $scope.btnWord = "Clipboard";
        }, 2000);
      };

    }

    $scope.options = {
      rowSelection: true,
      multiSelect: true,
      autoSelect: false
    };

    $scope.selected = [];

    var isImport = false;

    $scope.$watch('selected', function(newVal, oldVal) {
      var limit = $scope.query.limit;
 
      if(newVal.length - oldVal.length > 1) {
        var offers = angular.copy($scope.offers.rows);
        var currOffers = offers.length > limit ? offers.slice(0, limit) : offers;
        $scope.selected = currOffers.map(function(offer) {
          selectOffers.push(offersMap[offer.id])
          return offer.id;
        });
        isImport = false;
      } else if (oldVal.length - newVal.length > 1 && !isImport) {
        $scope.selected = [];
        selectOffers = [];
      } else if (newVal.length > oldVal.length) {
        selectOffers.push(offersMap[newVal[newVal.length-1]]);
        isImport = false;
      } else if (newVal.length < oldVal.length) {
        // 找出勾选取消的offerId
        var difference = oldVal.concat(newVal).filter(function(v) {
          return !oldVal.includes(v) || !newVal.includes(v)
        });
        selectOffers.forEach(function(offer, index) {
          if (offer.id == difference) {
            selectOffers.splice(index, 1);
          }
        });
        isImport = false;
      }
    }, true);

    $scope.applySearch = function() {
      $scope.query.type = $scope.type;
      $scope.query.filterValue = $scope.filterValue;
      $scope.query.__tk++;
    }

    $scope.changeClearValue = function() {
      $scope.filterValue = "";
    }

    $scope.showSelect = function() {
      $mdDialog.show({
        multiple: true,
        skipHide: true,
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: ['$mdDialog', '$scope', tsOfferSelect],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {affiliateNetworks: $scope.affiliateNetworks, affiliateNetworkMap: affiliateNetworkMap, taskId: $scope.taskId, selectOffers: selectOffers},
        templateUrl: 'tpl/ts-offer-select-dialog.html?' + +new Date()
      }).then(function(selectOffer) {
        if (selectOffer.length == 0) {
          $scope.selected = [];
          return;
        }
        selectOffers = [];
        $scope.selected = selectOffer.map(function(offer) {
          selectOffers.push(offersMap[offer.id])
          return offer.id;
        });
        isImport = true;
      })
    }

    function tsOfferSelect($mdDialog, $scope) {
      this.title = 'Select Offers';
      $scope.options = {
        rowSelection: true,
        multiSelect: true,
        autoSelect: false
      };

      $scope.selected = [];
      $scope.offers = this.selectOffers;
      
      this.importOffers = function(type) {
        $mdDialog.show({
          multiple: true,
          skipHide: true,
          clickOutsideToClose: false,
          escapeToClose: false,
          controller: ['$mdDialog', '$scope', 'OfferImport', importOffersCtrl],
          controllerAs: 'ctrl',
          focusOnOpen: false,
          bindToController: true,
          locals: {importType: type, affiliateNetworks: this.affiliateNetworks, affiliateNetworkMap: this.affiliateNetworkMap, taskId: this.taskId, selected: $scope.selected},
          templateUrl: 'tpl/import-offer-dialog.html?' + +new Date()
        }).then(function(selectOffer) {
          if (!selectOffer) {
            return;
          }
          if (selectOffer.length == $scope.offers.length) {
            $mdDialog.hide([]);
            return;
          }
          var tempSelect = [];
          selectOffers.forEach(function(offer, index) {
            if (selectOffer.indexOf(offer.id) < 0) {
              tempSelect.push(offer);
            }
          });
          $scope.offers = angular.copy(tempSelect);
          $scope.selected = [];
        });
      }
      this.cancel = function() {
        $mdDialog.hide($scope.offers);
      };
      this.onprocess = false;
    }

  }
})();
