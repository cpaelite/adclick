(function () {

  angular.module('app')
    .controller('TrackCampaignCtrl', [
      '$scope', '$mdDialog', '$timeout', 'Report', 'Preferences',
      TrackCampaignCtrl
    ]);

  function TrackCampaignCtrl($scope, $mdDialog, $timeout, Report, Preferences) {
    $scope.app.subtitle = 'TrackCampaign';

    $scope.query = {
      limit: 500,
      offset: 1,
      sort: 'visits',
      direction: 'desc',
      groupBy: 'campaign',
    };

    $scope.reportViewColumns = {};

    Preferences.get({}, function (preferences) {
      if (preferences.status == 1) {
        $scope.query.limit = preferences.data.reportViewLimit;
        $scope.query.sort = preferences.data.reportViewSort.key;
        $scope.query.direction = preferences.data.reportViewSort.direction;
        $scope.query.zt = preferences.data.reportTimeZone;
        $scope.query.status = preferences.data.entityType;
        $scope.reportViewColumns = preferences.data.reportViewColumns;
      }
    });
    $scope.datetype = 1;

    function success(result) {
      if (result.status == 1) {
        $scope.report = result.data;
      }
    }

    $scope.getList = function () {
      $scope.promise = Report.get($scope.query, success).$promise;
    };

    $scope.$watch('datetype', function (newValue, oldValue) {
      if (newValue != oldValue && newValue != 0) {
        getDateRange(newValue);
        $scope.getList();
      }
    });

    $scope.$watch('query', function (newValue, oldValue) {
      $scope.query.offset = 1;
      if (newValue.sort !== oldValue.sort) {
        var sort = newValue.sort;
        var direction = 'asc';
        var sign = sort.charAt(0);
        if (sign == '-') {
          sort = newValue.sort.substring(1);
          direction = 'desc';
        }
        $scope.query.sort = sort;
        $scope.query.direction = direction;
      }
      console.log(newValue == oldValue);
      $scope.getList();
    }, true);

    $scope.applyChange = function () {
      console.log($scope.reportViewColumns);
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
      //TODO 用户配置信息提交后台保存
    };

    $scope.search = function () {
      $scope.query.offset = 0;
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

    $scope.editItem = function (ev, item) {
      $mdDialog.show({
        clickOutsideToClose: false,
        controller: ['$scope', '$mdDialog', 'TrackCampaign', editItemCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {},
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
        locals: {item: item},
        bindToController: true,
        templateUrl: 'tpl/delete-confirm-dialog.html',
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

    $scope.columns = [
      {
        key: 'campaignName',
        name: 'Campaign'
      },
      {
        key: 'campaignId',
        name: 'Campaign ID'
      },
      {
        key: 'campaignUrl',
        name: 'Campaign URL'
      },
      {
        key: 'campaignCountry',
        name: 'Campaign country'
      },
      {
        key: 'impressions',
        name: 'Impressions'
      },
      {
        key: 'visits',
        name: 'Visits'
      },
      {
        key: 'clicks',
        name: 'Clicks'
      },
      {
        key: 'conversions',
        name: 'Conversions'
      },
      {
        key: 'revenue',
        name: 'Revenue'
      },
      {
        key: 'cost',
        name: 'Cost'
      },
      {
        key: 'profit',
        name: 'Profit'
      },
      {
        key: 'cpv',
        name: 'CPV'
      },
      {
        key: 'ictr',
        name: 'ICTR'
      }
    ];

  }

  function editItemCtrl($scope, $mdDialog, TrackCampaign) {
    if (this.item) {
      this.title = "edit";
    } else {
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
      $scope.item = {
        trafficSource: {},
        costModel: 0,
        targetType: 1,
        status: '1'
      };
      this.title = "add";
      $scope.urlToken = '';
    }

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
        TrackCampaign.save($scope.item, success);
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
      if (val == '1') {
        $scope.flowAction = false;
        $scope.urlTokenCon = true;
      } else if (val == '0') {
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
  }

  function deleteCtrl($mdDialog, TrackCampaign) {
    this.title = "delete";
    this.content = 'warnDelete';

    this.cancel = $mdDialog.cancel;

    function deleteItem(item) {
      var deferred = TrackCampaign.remove({id: item.id});
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
