(function () {

  angular.module('app')
    .controller('ReportCtrl', [
      '$scope', '$mdDialog', '$timeout', 'columnDefinition', 'Report', 'Preferences',
      ReportCtrl
    ]);

  function ReportCtrl($scope, $mdDialog, $timeout, columnDefinition, Report, Preferences) {
    var perfType = $scope.$state.current.name.split('.').pop();
    $scope.app.subtitle = perfType;

    $scope.query = {
      limit: $scope.preferences.reportViewLimit,
      offset: 1,
      sort: $scope.preferences.reportViewSort.key,
      direction: $scope.preferences.reportViewSort.direction,
      zt: $scope.preferences.reportTimeZone,
      status: $scope.preferences.entityType,
      groupBy: perfType
    };
    $scope.datetype = 1;
    $scope.reportSort = "-visits";
    $scope.reportViewColumns = angular.copy($scope.preferences.reportViewColumns);

    function success(result) {
      if (result.status == 1) {
        $scope.report = result.data;
      }
    }

    $scope.getList = function () {
      $scope.promise = Report.get($scope.query, success).$promise;
    };
    $scope.getList();

    $scope.$watch('datetype', function (newValue, oldValue) {
      if (newValue == oldValue) {
        return;
      }

      if (newValue != 0) {
        getDateRange(newValue);
        $scope.getList();
      }
      if (newValue == 0) {
          $scope.query.from = moment(new Date).format('YYYY-MM-DD');
          $scope.query.to = moment(new Date).add(1, 'days').format('YYYY-MM-DD');
      }
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
      Preferences.save();
    };

    $scope.search = function () {
      $scope.query.offset = 1;
      if ($scope.reportGroupby1) {
        $scope.query.groupBy = $scope.reportGroupby1;
      }
      $scope.getList();
    };

    $scope.lineClick = function (groupbyValue, filter, filterValue, filterIndex) {
      $scope.query.groupBy = groupbyValue;
      $scope.query['fileter'+filterIndex] = filter;
      $scope.query['fileter'+filterIndex+'Value'] = filterValue;
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
      var resource;
      var func;
      // 不同功能的编辑请求做不同的操作
      if (perfType == 'campaign') {
        resource = 'Campaign';
        func = editCampaignCtrl;
      } else if (perfType == 'flow') {
        resource = 'Flow';
        func = editFlowCtrl;
      } else if (perfType == 'lander') {
        resource = 'Lander';
        func = editLanderCtrl
      } else if (perfType == 'offer') {
        resource = 'Offer';
        func = editOfferCtrl;
      }
      $mdDialog.show({
        clickOutsideToClose: false,
        controller: ['$scope', '$mdDialog', resource, func],
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
        case '1':
          fromDate = moment(new Date).subtract(1, 'days').format('YYYY-MM-DD');
          toDate = moment(new Date).format('YYYY-MM-DD');
          break;
        case '2':
          fromDate = moment(new Date).subtract(6, 'days').format('YYYY-MM-DD');
          toDate = moment(new Date).format('YYYY-MM-DD');
          break;
        case '3':
          fromDate = moment(new Date).subtract(13, 'days').format('YYYY-MM-DD');
          toDate = moment(new Date).format('YYYY-MM-DD');
          break;
        case '4':
          fromDate = moment(new Date).day(1).format('YYYY-MM-DD');
          toDate = moment(new Date).format('YYYY-MM-DD');
          break;
        case '5':
          fromDate = moment(new Date).day(-6).format('YYYY-MM-DD');
          toDate = moment(new Date).day(0).format('YYYY-MM-DD');
          break;
        case '6':
          fromDate = moment(new Date).startOf('month').format('YYYY-MM-DD');
          toDate = moment(new Date).format('YYYY-MM-DD');
          break;
        case '7':
          fromDate = moment(new Date).subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
          toDate = moment(new Date).subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
          break;
      }
      $scope.datetype = value;
      $scope.query.from = fromDate;
      $scope.query.to = toDate;
    }
    // 获取不同页面的不同显示列
    var cols = columnDefinition[perfType].concat(columnDefinition['common']);
    $scope.columns = cols;

  }

  function editCampaignCtrl($scope, $mdDialog, Campaign) {
    if (this.item) {
      $scope.item = angular.copy(this.item);
      this.title = "edit";
    } else {
      $scope.item = {
        trafficSource: {},
        costModel: 0,
        targetType: 1,
        status: '1'
      };
      this.title = "add";
      $scope.urlToken = '';
    }
    this.titleType = angular.copy(this.perfType);

    this.cancel = $mdDialog.cancel;

    function success(item) {
      $mdDialog.hide(item);
    }

    this.save = function () {
      if($scope.item.costModel != 0 && $scope.item.costModel != 4) {
        $scope.item[$scope.radioTitle.toLowerCase()] = $scope.costModelValue;
      }
      $scope.editForm.$setSubmitted();
      if ($scope.editForm.$valid) {
        Campaign.save($scope.item, success);
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
      $scope.urlToken = $scope.urlToken + url;
    };
    $scope.isDisabled = false;
    $scope.trafficSources = [
      {
        id: 1,
        name: "Adwords"
      },
      {
        id: 2,
        name: "Popads"
      },
      {
        id: 3,
        name: "Avazu"
      }
    ];
    $scope.countries = [
      {
        "id": 1,
        "code": "AD",
        "name": "Andorra"
      }, {
        "id": 2,
        "code": "AE",
        "name": "United Arab Emirates"
      }, {
        "id": 3,
        "code": "AF",
        "name": "Afghanistan"
      }, {
        "id": 4,
        "code": "AG",
        "name": "Antigua And Barbuda"
      }, {
        "id": 5,
        "code": "AI",
        "name": "Anguilla"
      }
    ];
    $scope.flows = [
      {
        id: 1,
        name: "flow1"
      },
      {
        id: 2,
        name: "flow2"
      },
      {
        id: 3,
        name: "flow3"
      }
    ];
  }

  function editFlowCtrl($scope, $mdDialog, Flow) {
    if (this.item) {
      $scope.item = angular.copy(this.item);
      this.title = "edit";
    } else {
      $scope.item = {
      };
      this.title = "add";
    }

    this.titleType = angular.copy(this.perfType);

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
      $scope.item = angular.copy(this.item);
      this.title = "edit";
    } else {
      $scope.item = {
      };
      this.title = "add";
    }
    this.titleType = angular.copy(this.perfType);

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
  }

  function editOfferCtrl($scope, $mdDialog, Offer) {
    if (this.item) {
      $scope.item = angular.copy(this.item);
      this.title = "edit";
    } else {
      $scope.item = {
      };
      this.title = "add";
    }
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
      } else if (type == 'offer')  {
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
