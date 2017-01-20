(function () {

  angular.module('app')
    .controller('ReportCtrl', [
      '$scope', '$mdDialog', '$timeout', 'columnDefinition', 'reportFilter', 'Report', 'Preferences',
      ReportCtrl
    ]);

  function ReportCtrl($scope, $mdDialog, $timeout, columnDefinition, reportFilter, Report, Preferences) {
    var perfType = $scope.$state.current.name.split('.').pop();
    $scope.app.subtitle = perfType;

    // 初始化
    $scope.datetype = 1;
    $scope.fromDate = moment().format('YYYY-MM-DD');
    $scope.fromTime = '00:00';
    $scope.toDate = moment().add('days', 1).format('YYYY-MM-DD');
    $scope.toTime = '00:00';
    $scope.reportSort = "-visits";
    $scope.reportViewColumns = angular.copy($scope.preferences.reportViewColumns);
    $scope.repFilter = reportFilter;
    $scope.reportGroupby1 = "";
    $scope.reportGroupby2 = "";
    $scope.reportGroupby3 = "";
    $scope.query = {
      limit: $scope.preferences.reportViewLimit,
      offset: 1,
      sort: $scope.preferences.reportViewSort.key,
      direction: $scope.preferences.reportViewSort.direction,
      tz: $scope.preferences.reportTimeZone,
      active: $scope.preferences.entityType,
      groupBy: perfType,
      from: $scope.fromDate + ' ' + $scope.fromTime,
      to: $scope.toDate + ' ' + $scope.toTime
    };

    function success(result) {
      if (result.status == 1) {
        $scope.report = result.data;
      }
    }

    $scope.getList = function () {
      $scope.promise = Report.save($scope.query, success).$promise;
    };
    $scope.getList();

    $scope.$watch('datetype', function (newValue, oldValue) {
      if (newValue == oldValue) {
        return;
      }
      getDateRange(newValue);
    });

    $scope.$watch('query.status', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.getList();
      }
    });

    $scope.$watch('reportSort', function (newValue, oldValue) {
      $scope.query.offset = 1;
      if (newValue !== oldValue) {
        var sort = newValue;
        var direction = '';
        var sign = sort.charAt(0);
        if (sign == '-') {
          sort = newValue.substring(1);
          direction = 'desc';
        } else {
          direction = 'asc';
        }
        $scope.query.sort = sort;
        $scope.query.direction = direction;
        $scope.getList();
      }
    }, true);

    $scope.applyChange = function () {
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
      $scope.preferences.reportViewColumns = angular.copy($scope.reportViewColumns);
      //TODO 用户配置信息提交后台保存
      Preferences.save($scope.preferences);
    };

    $scope.checkboxIsChecked = function (num) {
      $scope.reportViewColumns[num].visible = !$scope.reportViewColumns[num].visible;
    };

    $scope.search = function () {
      $scope.query.offset = 1;
      $scope.query.from = $scope.fromDate + ' ' + $scope.fromTime;
      $scope.query.to = $scope.toDate + ' ' + $scope.toTime;
      $scope.getList();
    };

    $scope.lineClick = function (groupbyValue, filter, filterValue, filterIndex) {
      $scope.query.groupBy = groupbyValue;
      $scope.query['fileter' + filterIndex] = filter;
      $scope.query['fileter' + filterIndex + 'Value'] = filterValue;
      $scope.getList();
    };

    $scope.fab = [];
    var cacheToggle = [];
    $scope.toggleFab = function (idx, open) {
      $scope.fab[idx].isOpen = open;
      if (open) {
        cacheToggle[idx] = $timeout(function () {
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

    var editTemplateUrl = 'tpl/' + perfType + '-edit-dialog.html';

    $scope.editItem = function (ev, item) {
      var controller;
      // 不同功能的编辑请求做不同的操作
      if (perfType == 'campaign') {
        controller = ['$scope', '$mdDialog', 'Campaign', 'Flows', 'TrafficSources', editCampaignCtrl];
      } else if (perfType == 'flow') {
        controller = ['$scope', '$mdDialog', 'Flow', editFlowCtrl];
      } else if (perfType == 'lander') {
        controller = ['$scope', '$mdDialog', 'Lander', editLanderCtrl];
      } else if (perfType == 'offer') {
        controller = ['$scope', '$mdDialog', 'Offer', 'AffiliateNetworks', editOfferCtrl];
      }

      $mdDialog.show({
        clickOutsideToClose: false,
        controller: controller,
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {item: item, perfType: perfType},
        bindToController: true,
        targetEvent: ev,
        templateUrl: editTemplateUrl
      }).then($scope.getList);
    };

    $scope.deleteItem = function (ev, item) {
      $mdDialog.show({
        clickOutsideToClose: true,
        controller: ['$mdDialog', 'Campaign', 'Flow', 'Lander', 'Offer', deleteCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        targetEvent: ev,
        locals: {type: perfType, item: item},
        bindToController: true,
        templateUrl: 'tpl/delete-confirm-dialog.html'
      }).then($scope.getList);
    };
    $scope.viewColumnIsShow = false;
    $scope.viewColumnClick = function () {
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
    };

    $scope.viewCloumnClose = function () {
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
    };

    function getDateRange(value) {
      var fromDate;
      var toDate;
      switch (value) {
        case '0':
          fromDate = moment().format('YYYY-MM-DD');
          toDate = moment().add('days', 1).format('YYYY-MM-DD');
        case '1':
          fromDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
          toDate = moment().format('YYYY-MM-DD');
          break;
        case '2':
          fromDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
          toDate = moment().format('YYYY-MM-DD');
          break;
        case '3':
          fromDate = moment().subtract(13, 'days').format('YYYY-MM-DD');
          toDate = moment().format('YYYY-MM-DD');
          break;
        case '4':
          fromDate = moment().day(1).format('YYYY-MM-DD');
          toDate = moment().format('YYYY-MM-DD');
          break;
        case '5':
          fromDate = moment().day(-6).format('YYYY-MM-DD');
          toDate = moment().day(0).format('YYYY-MM-DD');
          break;
        case '6':
          fromDate = moment().startOf('month').format('YYYY-MM-DD');
          toDate = moment().format('YYYY-MM-DD');
          break;
        case '7':
          fromDate = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
          toDate = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
          break;
      }
      $scope.datetype = value;
      $scope.fromDate = fromDate;
      $scope.toDate = toDate;
      $scope.query.from = $scope.fromDate + ' ' + $scope.fromTime;
      $scope.query.to = $scope.toDate + ' ' + $scope.toTime;
    }

    // 获取不同页面的不同显示列
    var cols = columnDefinition[perfType].concat(columnDefinition['common']);
    $scope.columns = cols;

    // tree isShow
    $scope.trData = [
      {
        id: 32,
        name: 'campaign1',
        impressions: 2,
        visits: 3,
        click: 4,
        conversions: 5,
        revenue: 6,
        cost: 7,
        profit: 8,
        cpv: 9,
        ictr: 10,
        operation: 11
      },
      {
        id: 33,
        name: 'campaign2',
        impressions: 2,
        visits: 3,
        click: 4,
        conversions: 5,
        revenue: 6,
        cost: 7,
        profit: 8,
        cpv: 9,
        ictr: 10,
        operation: 11
      }
    ];
    $scope.selectedIndex = 0;
    $scope.select = function (i) {


    };
    $scope.isActive = [];
    $scope.isDown = [];
    $scope.treeFirstChildIsShow = [];
    $scope.treeSecondChildIsShow = [];
    $scope.firstTreeClick = function ($index) {
      $scope.isActive[$index] = !$scope.isActive[$index];
      $scope.treeFirstChildIsShow[$index] = !$scope.treeFirstChildIsShow[$index];
      $scope.treeSecondChildIsShow[$index] = false;
    };
    $scope.secondTreeClick = function ($index) {
      $scope.isDown[$index] = !$scope.isDown[$index];
      $scope.treeSecondChildIsShow[$index] = !$scope.treeSecondChildIsShow[$index];
    };
  }

  function editCampaignCtrl($scope, $mdDialog, Campaign, Flows, TrafficSources) {
    if (this.item) {
      Campaign.get({id: this.item.id}, function(campaign) {
        $scope.item = angular.copy(campaign);
      });
      this.title = "edit";
    } else {
      $scope.item = {
        costModel: 0,
        redirectMode: 0,
        targetType: 1,
        status: '1',
        tags: []
      };
      this.title = "add";
    }
    this.titleType = angular.copy(this.perfType);

    // TrafficSource
    TrafficSources.get(null, function (trafficSource) {
      $scope.trafficSources = trafficSource.data.trafficsources;
    });

    // Country
    $scope.countries = $scope.$root.countries;

    // Flow
    Flows.get(null, function (flow) {
      $scope.flows = flow.data.flows;
    });

    this.cancel = $mdDialog.cancel;

    function success(item) {
      $mdDialog.hide(item);
    }

    this.save = function () {
      // cost model value
      if ($scope.item.costModel != 0 && $scope.item.costModel != 4) {
        $scope.item[$scope.radioTitle.toLowerCase()] = $scope.costModelValue;
      }

      var country = $scope.countries[$scope.country];
      $scope.country = country;

      $scope.editForm.$setSubmitted();
      if ($scope.editForm.$valid) {
        Campaign.save($scope.item, success);
      }
    };

    var self = this;
    self.readonly = false;
    self.newVeg = function (chip) {
      return {
        name: chip,
        type: 'unknown'
      };
    };

    $scope.visible = false;
    $scope.ztreeShow = false;
    $scope.toggleShow = function (type) {
      if (type == '1') {
        $scope.visible = !$scope.visible;
        $scope.isActive = !$scope.isActive;
      } else {
        $scope.ztreeShow = !$scope.ztreeShow;
        $scope.isActive1 = !$scope.isActive1;
      }
    };

    $scope.typeRadio = false;
    $scope.radioSelect = function (type) {
      $scope.typeRadio = true;
      $scope.radioTitle = type;
    };

    $scope.flowAction = true;
    $scope.urlTokenCon = false;
    $scope.destinationType = function (val) {
      if (val == '0') {
        $scope.flowAction = false;
        $scope.urlTokenCon = true;
      } else if (val == '1') {
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
    $scope.urlTokenClick = function (url) {
      var targetUrl = $scope.item.targetUrl;
      if (!targetUrl) {
        targetUrl = '';
      }
      if (targetUrl.indexOf(url) == -1) {
        $scope.item.targetUrl = targetUrl + url;
      }
    };
    $scope.isDisabled = false;
  }

  function editFlowCtrl($scope, $mdDialog, Flow) {
    if (this.item) {
      Flow.get({id: this.item.id}, function (flow) {
        $scope.item = angular.copy(flow);
      });
      this.title = "edit";
    } else {
      $scope.item = {
        url: ''
      };
      this.title = "add";
    }

    this.titleType = angular.copy(this.perfType);

    // Country
    $scope.countries = $scope.$root.countries;

    this.cancel = $mdDialog.cancel;

    function success(item) {
      $mdDialog.hide(item);
    }

    this.save = function () {
      $scope.editForm.$setSubmitted();
      if ($scope.editForm.$valid) {
        Flow.save($scope.item, success);
      }
    };
  }

  function editLanderCtrl($scope, $mdDialog, Lander) {
    if (this.item) {
      Lander.get({id: this.item.id}, function (lander) {
        $scope.item = angular.copy(lander);
      });
      this.title = "edit";
    } else {
      $scope.item = {
        url: 'http://',
        numberOfOffers: 1
      };
      this.title = "add";
    }
    this.titleType = angular.copy(this.perfType);

    // Country
    $scope.countries = $scope.$root.countries;

    this.cancel = $mdDialog.cancel;

    function success(item) {
      $mdDialog.hide(item);
    }

    this.save = function () {
      $scope.editForm.$setSubmitted();
      if ($scope.editForm.$valid) {
        Lander.save($scope.item, success);
      }
    };

    var self = this;
    self.readonly = false;
    $scope.item.tags = [];
    self.newVeg = function (chip) {
      return {
        name: chip,
        type: 'unknown'
      };
    };
    $scope.urlItem = [
      "{campaign.id}",
      "{brand}",
      "{device}",
      "{trafficSource.name}",
      "{trafficSource.id}",
      "{lander.id}"
    ];
    $scope.urlTokenClick = function (url) {
      var itemUrl = $scope.item.url;
      if (itemUrl.indexOf(url) == -1) {
        $scope.item.url = itemUrl + url;
      }
    };
  }

  function editOfferCtrl($scope, $mdDialog, Offer, AffiliateNetworks) {
    if (this.item) {
      Offer.get({id: this.item.id}, function (offer) {
        $scope.item = angular.copy(offer);
      });
      this.title = "edit";
    } else {
      $scope.item = {
        payoutMode: 0,
        url: ''
      };
      this.title = "add";
    }

    // Country
    $scope.countries = $scope.$root.countries;

    // AffiliateNetword
    $scope.affiliates = [
      {id: 1, name: '1'},
      {id: 2, name: '2'},
      {id: 3, name: '3'}
    ];

    this.titleType = angular.copy(this.perfType);

    this.cancel = $mdDialog.cancel;

    function success(item) {
      $mdDialog.hide(item);
    }

    this.save = function () {
      $scope.editForm.$setSubmitted();
      if ($scope.editForm.$valid) {
        Offer.save($scope.item, success);
      }
    };
    var self = this;
    self.readonly = false;
    $scope.item.tags = [];
    self.newVeg = function (chip) {
      return {
        name: chip,
        type: 'unknown'
      };
    };
    $scope.urlItem = [
      "{campaign.id}",
      "{brand}",
      "{device}",
      "{trafficSource.name}",
      "{trafficSource.id}",
      "{lander.id}"
    ];
    $scope.urlTokenClick = function (url) {
      var itemUrl = $scope.item.url;
      if (itemUrl.indexOf(url) == -1) {
        $scope.item.url = itemUrl + url;
      }
    };
  }

  function deleteCtrl($mdDialog, Campaign, Flow, Lander, Offer) {
    this.title = "delete";
    this.content = 'warnDelete';

    this.cancel = $mdDialog.cancel;

    function deleteItem(item) {
      var deferred;
      if (type == 'campaign') {
        deferred = Campaign.remove({id: item.id});
      } else if (type == 'flow') {
        deferred = Flow.remove({id: item.id});
      } else if (type == 'lander') {
        deferred = Lander.remove({id: item.id});
      } else if (type == 'offer') {
        deferred = Offer.remove({id: item.id});
      }
      return deferred.$promise;
    }

    this.ok = function () {
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
