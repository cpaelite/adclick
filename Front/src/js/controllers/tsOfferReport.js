(function () {
  'use strict';

  angular.module('app')
    .controller('TsOfferReportCtrl', ['$scope', '$q', '$mdDialog', 'AffiliateTemplate', 'ThirdAffiliate', 'ThirdOffer', 'OfferTask', '$timeout', 'OfferImport', 'AffiliateNetwork', '$document', TsOfferReportCtrl])
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
              'height': (scope.windowHeight - 46 - scope.navHeight - scope.filterHeight - 56 - 33 - 5 - 48) + 'px'
            })
          })
        }

        heightResize();

        w_h.bind('resize', function() {
          heightResize();
        });
      }
    }]);

  function TsOfferReportCtrl($scope, $q, $mdDialog, AffiliateTemplate, ThirdAffiliate, ThirdOffer, OfferTask, $timeout, OfferImport, AffiliateNetwork, $document) {
    $scope.app.subtitle = 'Network Offers';
    $scope.thirdAffiliateId = '';
    $scope.taskId = '';
    $scope.query = {
      page: 1,
      limit: 50,
      __tk: 0
    };
    $scope.type = 0;

    $scope.networkOfferLimit = $scope.permissions.report.networkoffer.anOfferAPILimit;

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

    var offersMap = {};
    var selectOffers = [];
    // 获取第三方Offer
    function getThirdOffers() {
      var params = {};
      angular.extend(params, $scope.query, {taskId: $scope.taskId});
      delete params.__tk;
      $scope.promise = ThirdOffer.get(params, function(oData) {
        if(oData.status == 1) {
          $scope.offers = oData.data;
          rerenderTable($scope.offers);
          oData.data.rows.forEach(function(offer) {
            offersMap[offer.id] = offer;
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
          rerenderTable($scope.offers);
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
        selectOffers = [];
        selectMap = {};
        $scope.selected = [];
        rerenderTable($scope.offers);
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
      }).then(function(offers) {
        $mdDialog.hide(offers);
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
              $mdDialog.hide(self.oData.data.offers);
            } else {
              self.error = oData.message;
            }
          });
        } else {
          $mdDialog.hide([]);
        }
      };

      this.cancel = function() {
        $mdDialog.hide([]);
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

    // var isImport = false;

    // $scope.$watch('selected', function(newVal, oldVal) {
    //   var limit = $scope.query.limit;
    //
    //   if(newVal.length - oldVal.length > 1) {
    //     var offers = angular.copy($scope.offers.rows);
    //     var currOffers = offers.length > limit ? offers.slice(0, limit) : offers;
    //     $scope.selected = currOffers.map(function(offer) {
    //       selectOffers.push(offersMap[offer.id])
    //       return offer.id;
    //     });
    //     isImport = false;
    //   } else if (oldVal.length - newVal.length > 1 && !isImport) {
    //     $scope.selected = [];
    //     selectOffers = [];
    //   } else if (newVal.length > oldVal.length) {
    //     selectOffers.push(offersMap[newVal[newVal.length-1]]);
    //     isImport = false;
    //   } else if (newVal.length < oldVal.length) {
    //     // 找出勾选取消的offerId
    //     var difference = oldVal.concat(newVal).filter(function(v) {
    //       return !oldVal.includes(v) || !newVal.includes(v)
    //     });
    //     var tempSelect = [];
    //     selectOffers.forEach(function(offer, index) {
    //       if ($scope.selected.indexOf(offer.id) >= 0) {
    //         tempSelect.push(offer);
    //       }
    //     });
    //     selectOffers = angular.copy(tempSelect);
    //     isImport = false;
    //   }
    // }, true);

    $scope.$watch('filterValue', function(newVal, oldVal) {
      if (oldVal && !newVal) {
        $scope.query.type = $scope.type;
        $scope.query.filterValue = $scope.filterValue;
        $scope.query.__tk++;
      }
    });

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
        templateUrl: 'tpl/ts-offer-select-dialog.html?' + +new Date(),
        onComplete: function(scope, element) {
          rerenderDialogTable(scope.offers);
          var selectAll = new SelectAll({
            container: '#ts_offer_selected_report_table_container',
            checkboxAll: '.dialog-checkbox-all',
            checkboxItem: '.checkbox-item'
          });
          selectAll.on('uncheck_item', function(oData) {
            scope.$apply(function() {
              scope.selected.splice(scope.selected.indexOf(Number(oData.id)), 1);
            });
          });

          selectAll.on('check_item', function(oData) {
            scope.$apply(function() {
              scope.selected.push(oData.id);
            });
          });

          selectAll.on('uncheck_all', function() {
            scope.$apply(function() {
              scope.selected = [];
            });
          });

          selectAll.on('check_all', function() {
            var all = [];
            scope.offers.forEach(function(offer) {
              all.push(offer.id);
            });

            scope.$apply(function() {
              scope.selected = all;
            });
          });
        }
      }).then(function(selectOffer) {
        if (selectOffer.length == $scope.selected.length) {
          return;
        }
        if (selectOffer.length == 0) {
          selectOffers = [];
          selectMap = {};
          $scope.selected = [];
        } else {
          var tempSelect = [], tempSelected = [];
          selectOffer.forEach(function(offer, index) {
            tempSelect.push(offer);
            tempSelected.push(offer.id);
            selectMap[offer.id] = offer;
          });
          selectOffers = angular.copy(tempSelect);
          $scope.selected = angular.copy(tempSelected);
        }
        rerenderTable($scope.offers);
      });
    }

    function tsOfferSelect($mdDialog, $scope) {
      this.title = 'Select Offers';
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
          if (!selectOffer || selectOffer.length == 0) return;
          if (selectOffer.length == $scope.offers.length) {
            $mdDialog.hide([]);
            return;
          }
          var tempSelect = [];
          selectOffers.forEach(function(offer, index) {
            if (selectOffer.indexOf(Number(offer.id)) < 0) {
              tempSelect.push(offer);
            }
          });
          $scope.offers = angular.copy(tempSelect);
          $scope.selected = [];
          rerenderDialogTable($scope.offers);
        });
      }
      this.cancel = function() {
        $mdDialog.hide($scope.offers);
      };
      this.onprocess = false;
    }

    function rerenderTable(offers) {
      var offers = angular.copy(offers), selectedAll = true;
      offers.rows.map(function(offer) {
        offer.selected = $scope.selected.indexOf(offer.id) > -1;
        if(!offer.selected && selectedAll) {
          selectedAll = false;
        }
        return offer;
      });
      var tempHtml = $.temp($('#ts_offer_report_tpl').html(), {
        offers: offers
      });
      $('#ts_offer_report_container').empty().append(tempHtml);
      if(selectedAll && offers.rows.length > 0) {
        $('.checkbox-all').addClass('md-checked');
      } else {
        $('.checkbox-all').removeClass('md-checked');
      }
    }

    function rerenderDialogTable(offers) {
      var tempHtml = $.temp($('#ts_offer_selected_report_tpl').html(), {
        offers: offers
      });
      $('#ts_offer_selected_report_container').empty().append(tempHtml);
    }

    function init() {
      $('#ts_offer_report_table_container').on('click', '.offer-detail', function() {
        var id = $(this).closest('tr').attr('data-id');
        $scope.offerDetail(offersMap[id]);
      });

      $('#ts_offer_report_table_container').on('click', '.clipboard-tracking-link, .clipboard-preview-link', function() {
        var $this = $(this), text = $(this).attr('data-text');
        var node = $document[0].createElement('textarea');
        node.style.position = 'absolute';
        node.textContent = text;
        node.style.left = '-10000px';
        $document[0].body.appendChild(node);
        try {
          $document[0].body.style.webkitUserSelect = 'initial';
          var selection = $document[0].getSelection();
          selection.removeAllRanges();
          node.select();
          if(!$document[0].execCommand('copy')) {
              throw('failure copy');
          }
          selection.removeAllRanges();
        } finally {
          $document[0].body.style.webkitUserSelect = '';
        }
        $document[0].body.removeChild(node);

        $this.find('span').text('Copied');
        $timeout(function() {
          $this.find('span').text('Clipboard');
        }, 1000);
      });
    }

    init();

    function getSelectOffers() {
      var tempSelectOffers = [];
      for(var k in selectMap) {
        tempSelectOffers.push(selectMap[k]);
      }
      selectOffers = tempSelectOffers;
    }

    // checkbox
    function SelectAll(_op) {
      var self = this;
      self.op = $.extend({}, SelectAll._op, _op || {});
      self.init();
      self.initEvent();
    }

    SelectAll.prototype.init = function() {
      NewBidder.common.inherit(this, NewBidder.common.Observer);
      var self = this;
      self.$container = $(self.op.container);
    };

    SelectAll.prototype.initEvent = function() {
      var self = this;
      self.$container.on('click', self.op.checkboxItem, function() {
        var $this = $(this), id = $this.attr('data-id');
        if($this.is('.md-checked')) {
          $this.removeClass('md-checked');
          $(self.op.checkboxAll).removeClass('md-checked');
          self.trigger('uncheck_item', [{id: id}]);
        } else {
          $this.addClass('md-checked');
          if(self.$container.find(self.op.checkboxItem).not('.md-checked').length == 0) {
            $(self.op.checkboxAll).addClass('md-checked');
          }
          self.trigger('check_item', [{id: id}]);
        }
      });

      self.$container.on('click', self.op.checkboxAll, function() {
        if($(this).is('.md-checked')) {
          $(this).removeClass('md-checked');
          self.$container.find(self.op.checkboxItem).removeClass('md-checked');
          self.trigger('uncheck_all');
        } else {
          $(this).addClass('md-checked');
          self.$container.find(self.op.checkboxItem).addClass('md-checked');
          self.trigger('check_all');
        }
      });
    };

    SelectAll._op = {
      container: '#ts_offer_report_table_container',
      checkboxAll: '.checkbox-all',
      checkboxItem: '.checkbox-item'
    };

    var selectAll = new SelectAll();
    var selectMap = {};

    selectAll.on('uncheck_item', function(oData) {
      delete selectMap[oData.id];

      $scope.$apply(function() {
        $scope.selected.splice($scope.selected.indexOf(Number(oData.id)), 1);
      });
      getSelectOffers();
    });

    selectAll.on('check_item', function(oData) {
      selectMap[oData.id] = offersMap[oData.id];
      $scope.$apply(function() {
        $scope.selected.push(oData.id);
      });
      getSelectOffers();
    });

    selectAll.on('uncheck_all', function() {
      var all = [];
      $scope.offers.rows.forEach(function(offer) {
        delete selectMap[offer.id];
      });
      for(var key in selectMap) {
        all.push(selectMap[key].id);
      }
      $scope.$apply(function() {
        $scope.selected = all;
      });
      getSelectOffers();
    });

    selectAll.on('check_all', function() {
      var all = [];
      $scope.offers.rows.forEach(function(offer) {
        selectMap[offer.id] = offer;
      });
      for(var key in selectMap) {
        all.push(selectMap[key].id);
      }
      $scope.$apply(function() {
        $scope.selected = all;
      });
      getSelectOffers();
    });
  }
})();
