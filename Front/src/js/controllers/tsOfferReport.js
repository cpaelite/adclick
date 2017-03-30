(function () {
  'use strict';

  angular.module('app').controller('TsOfferReportCtrl', ['$scope', '$q', '$mdDialog', 'AffiliateTemplate', 'ThirdAffiliate', TsOfferReportCtrl]);

  function TsOfferReportCtrl($scope, $q, $mdDialog, AffiliateTemplate, ThirdAffiliate) {
    $scope.query = {
      page: 1,
      id: '',
      __tk: 0
    };

    var unwatch = $scope.$watch('preferences', function(newVal, oldVal) {
      if (!newVal) return;
      angular.extend($scope.query, {
        limit: newVal.reportViewLimit,
        order: newVal.reportViewOrder,
        tz: newVal.reportTimeZone
      });

      unwatch();
      unwatch = null;
    }, true);

    $scope.$watch('query', function (newVal, oldVal) {
      if (!newVal || !newVal.limit || !newVal.taskId) {
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
      // TODO
    }

    var thirdAffiliatesMap = {};
    var affiliateTemplateMap = {};
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
    // 获取当前第三方连接的Task状态

    // 通过taskID拉去最新的Offer列表

    // 选取部分OFffer进行导入

    // 是否覆盖

    $q.all(initPromises).then(initSuccess);

    function initSuccess() {
      if($scope.thirdAffiliates.length > 0) {
        $scope.query.id = $scope.thirdAffiliates[0].id;
      }
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
        getList();
        getTsReferences();
      });
    };

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
          if(id && id == thirdAffiliates.id) {
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

    $scope.selected = [1,2];

    // $scope.$watch('selected', function(oData, oldValue) {
    //   console.log(oData, oldValue);
    // }, true);

    $scope.desserts = {
      "totalRows": 9,
      "data": [
        {
          id: 1,
          "name": "Frozen yogurt",
          "type": "Ice cream",
          "calories": { "value": 159.0 },
          "fat": { "value": 6.0 },
          "carbs": { "value": 24.0 },
          "protein": { "value": 4.0 },
          "sodium": { "value": 87.0 },
          "calcium": { "value": 14.0 },
          "iron": { "value": 1.0 }
        }, {
          id: 2,
          "name": "Ice cream sandwich",
          "type": "Ice cream",
          "calories": { "value": 237.0 },
          "fat": { "value": 9.0 },
          "carbs": { "value": 37.0 },
          "protein": { "value": 4.3 },
          "sodium": { "value": 129.0 },
          "calcium": { "value": 8.0 },
          "iron": { "value": 1.0 }
        }, {
          id: 3,
          "name": "Eclair",
          "type": "Pastry",
          "calories": { "value":  262.0 },
          "fat": { "value": 16.0 },
          "carbs": { "value": 24.0 },
          "protein": { "value":  6.0 },
          "sodium": { "value": 337.0 },
          "calcium": { "value":  6.0 },
          "iron": { "value": 7.0 }
        }, {
          id: 4,
          "name": "Cupcake",
          "type": "Pastry",
          "calories": { "value":  305.0 },
          "fat": { "value": 3.7 },
          "carbs": { "value": 67.0 },
          "protein": { "value": 4.3 },
          "sodium": { "value": 413.0 },
          "calcium": { "value": 3.0 },
          "iron": { "value": 8.0 }
        }, {
          id: 5,
          "name": "Jelly bean",
          "type": "Candy",
          "calories": { "value":  375.0 },
          "fat": { "value": 0.0 },
          "carbs": { "value": 94.0 },
          "protein": { "value": 0.0 },
          "sodium": { "value": 50.0 },
          "calcium": { "value": 0.0 },
          "iron": { "value": 0.0 }
        }, {
          id: 6,
          "name": "Lollipop",
          "type": "Candy",
          "calories": { "value": 392.0 },
          "fat": { "value": 0.2 },
          "carbs": { "value": 98.0 },
          "protein": { "value": 0.0 },
          "sodium": { "value": 38.0 },
          "calcium": { "value": 0.0 },
          "iron": { "value": 2.0 }
        }, {
          id: 7,
          "name": "Honeycomb",
          "type": "Other",
          "calories": { "value": 408.0 },
          "fat": { "value": 3.2 },
          "carbs": { "value": 87.0 },
          "protein": { "value": 6.5 },
          "sodium": { "value": 562.0 },
          "calcium": { "value": 0.0 },
          "iron": { "value": 45.0 }
        }, {
          id: 8,
          "name": "Donut",
          "type": "Pastry",
          "calories": { "value": 452.0 },
          "fat": { "value": 25.0 },
          "carbs": { "value": 51.0 },
          "protein": { "value": 4.9 },
          "sodium": { "value": 326.0 },
          "calcium": { "value": 2.0 },
          "iron": { "value": 22.0 }
        }, {
          id: 9,
          "name": "KitKat",
          "type": "Candy",
          "calories": { "value": 518.0 },
          "fat": { "value": 26.0 },
          "carbs": { "value": 65.0 },
          "protein": { "value": 7.0 },
          "sodium": { "value": 54.0 },
          "calcium": { "value": 12.0 },
          "iron": { "value": 6.0 }
        }
      ]
    };

  }
})();
