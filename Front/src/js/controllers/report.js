(function () {

  angular.module('app')
    .controller('ReportCtrl', [
      '$scope', '$mdDialog', '$timeout', 'columnDefinition', 'groupByOptions', 'Report', 'Preference',
      ReportCtrl
    ]);

  function ReportCtrl($scope, $mdDialog, $timeout, columnDefinition, groupByOptions, Report, Preference) {
    var perfType = $scope.$state.current.name.split('.').pop().toLowerCase();
    $scope.app.subtitle = perfType;

    // 初始化
    $scope.treeLevel = 1;
    $scope.datetype = '1';
    $scope.fromDate = moment().format('YYYY-MM-DD');
    $scope.fromTime = '00:00';
    $scope.toDate = moment().add(1, 'days').format('YYYY-MM-DD');
    $scope.toTime = '00:00';
    $scope.groupByOptions = groupByOptions;
    $scope.groupBy = [perfType, "", ""];
    $scope.query = {
      page: 1,
      __tk: 0
    };

    var currentGroupBy = angular.copy($scope.groupBy);
    var currentStatus;
    var currentDateRange = {};

    getDateRange($scope.datetype);

    var groupMap = {};
    groupByOptions.forEach(function(group) {
      groupMap[group.value] = group;
    });

    function buildSuccess(parentRow) {
      return function success(result) {
        if (result.status == 1) {
          if (!parentRow) {
            parentRow = { treeLevel: 0, expanded: true };
          }

          var group = currentGroupBy[parentRow.treeLevel];
          var nameKey = groupMap[group].nameKey;

          var rows = [];
          result.data.rows.forEach(function(row) {
            if ($scope.treeLevel > 1) {
              row.name = row[nameKey];
            }
            rows.push({
              treeLevel: parentRow.treeLevel + 1,
              expanded: false,
              parentRow: parentRow,
              childrenLoaded: false,
              data: row
            });
          });

          if (parentRow.treeLevel > 0) {
            var idx = $scope.report.rows.indexOf(parentRow);
            Array.prototype.splice.apply($scope.report.rows, [idx+1, 0].concat(rows));
            parentRow.childrenLoaded = true;
            parentRow.expanded = true;
          } else {
            $scope.report = result.data;
            $scope.report.rows = rows;
          }
        }
      };
    }

    function getList(parentRow) {
      var params = angular.extend({}, $scope.query, currentDateRange);
      params.status = currentStatus;
      delete params.__tk;

      if (parentRow) {
        params.groupBy = currentGroupBy[parentRow.treeLevel];
        params.page = 1;
        params.limit = -1;

        var group = currentGroupBy[0];
        var idKey = groupMap[group].idKey;
        params[group] = parentRow.data[idKey];

        if (parentRow.treeLevel == 2) {
          var ppRow = parentRow.parentRow;
          group = currentGroupBy[1];
          idKey = groupMap[group].idKey;
          params[group] = ppRow.data[idKey];
        }
      } else {
        params.groupBy = currentGroupBy[0];
      }

      $scope.promise = Report.get(params, buildSuccess(parentRow)).$promise;
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

      getList();
    }, true);

    var unwatch = $scope.$watch('preferences', function(newVal, oldVal) {
      if (!newVal)
        return;

      $scope.reportViewColumns = angular.copy(newVal.reportViewColumns);
      angular.extend($scope.query, {
        limit: newVal.reportViewLimit,
        order: newVal.reportViewOrder,
        tz: newVal.reportTimeZone
      });
      $scope.activeStatus = newVal.entityType;
      currentStatus = newVal.entityType;

      unwatch();
      unwatch = null;
    }, true);

    $scope.changeGroupby = function(idx) {
      if (idx == 0) {
        $scope.groupBy[1] = "";
      }
      $scope.groupBy[2] = "";
    };

    function filteGroupBy(level) {
      return function(item) {
        // todo: selected should contian filters
        var selected = [];
        selected.push($scope.groupBy[0]);
        if (level == 2)
          selected.push($scope.groupBy[1]);
        return selected.indexOf(item) == -1;
      }
    }
    $scope.filteGroupBy1 = filteGroupBy(1);
    $scope.filteGroupBy2 = filteGroupBy(2);

    $scope.applySearch = function(evt) {
      $scope.treeLevel = $scope.groupBy.filter(function(item) { return !!item; }).length;
      if ($scope.treeLevel == 0) {
        $mdDialog.show(
          $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('No group by')
          .textContent('You need to select at least one group by!')
          .ok('Got it!')
        );
        return;
      }
      currentGroupBy = angular.copy($scope.groupBy);
      getDateRange($scope.datetype);
      currentStatus = $scope.activeStatus;
      $scope.query.page = 1;
      $scope.query.__tk += 1;
      // dirty fix tree view name column
      if ($scope.treeLevel > 1) {
        $scope.columns[0].key = 'name';
        $scope.columns[0].name = 'Name';
      } else {
        $scope.columns[0].key = $scope.columns[0].origKey;
        $scope.columns[0].name = $scope.columns[0].origName;
      }
    };

    $scope.toggleRow = function(row) {
      if (row.expanded) {
        row.expanded = false;
        $scope.report.rows.forEach(function(item) {
          if (item.parentRow == row)
            item.expanded = false;
        });
        return;
      }
      if (row.childrenLoaded) {
        row.expanded = true;
        return;
      } else {
        getList(row);
      }
    };

    $scope.openMenu = function(row, key) {
      // todo
      if (key == 'name') {
      }
    };

    var editTemplateUrl = 'tpl/' + perfType + '-edit-dialog.html';
    // fixme: dirty fix, rename the file
    if (perfType == 'trafficsource')
      editTemplateUrl = 'tpl/trafficSource-edit-dialog.html';

    $scope.editItem = function (ev, item) {
      var controller;
      // 不同功能的编辑请求做不同的操作
      if (perfType == 'campaign') {
        controller = ['$scope', '$mdDialog', 'Campaign', 'Flow', 'TrafficSource', editCampaignCtrl];
      } else if (perfType == 'flow') {
        //controller = ['$scope', '$mdDialog', 'Flow', editFlowCtrl];
        $scope.$state.go('app.flow');
        return;
      } else if (perfType == 'lander') {
        controller = ['$scope', '$mdDialog', 'Lander', editLanderCtrl];
      } else if (perfType == 'offer') {
        controller = ['$scope', '$mdDialog', 'Offer', 'AffiliateNetwork', editOfferCtrl];
      } else if (perfType == 'trafficsource') {
        controller = ['$scope', '$mdDialog', 'TrafficSource', editTrafficSourceCtrl];
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
      }).then(getList);
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
      }).then(getList);
    };

    $scope.viewColumnIsShow = false;
    $scope.viewColumnClick = function () {
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
    };
    // todo: use array for report visible columns
    $scope.applyChange = function () {
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
      $scope.preferences.reportViewColumns = angular.copy($scope.reportViewColumns);
      Preference.save($scope.preferences);
    };

    $scope.checkboxIsChecked = function (num) {
      $scope.reportViewColumns[num].visible = !$scope.reportViewColumns[num].visible;
    };
    $scope.viewCloumnClose = function () {
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
    };

    function getDateRange(value) {
      var fromDate;
      var toDate;
      switch (value) {
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
      if (value == '0') {
        currentDateRange.from = $scope.fromDate + 'T' + $scope.fromTime;
        currentDateRange.to = $scope.toDate + 'T' + $scope.toTime;
      } else {
        currentDateRange.from = fromDate + 'T00:00';
        currentDateRange.to = toDate + 'T23:59';
      }
    }

    // 获取不同页面的不同显示列
    var cols = angular.copy(columnDefinition[perfType]).concat(columnDefinition['common']);
    // dirty fix tree view name column
    cols[0].origKey = cols[0].key;
    cols[0].origName = cols[0].name;
    $scope.columns = cols;
  }

  function editCampaignCtrl($scope, $mdDialog, Campaign, Flow, TrafficSource) {
    $scope.tags = [];
    if (this.item) {
      Campaign.get({id: 18}, function(campaign) {
        $scope.item = angular.copy(campaign.data);
        if ($scope.item.costModel == 1) {
          $scope.radioTitle = 'CPC';
          $scope.costModelValue = $scope.item.cpcValue;
        } else if ($scope.item.costModel == 2) {
          $scope.radioTitle = 'CPA';
          $scope.costModelValue = $scope.item.cpaValue;
        } else if ($scope.item.costModel == 3) {
          $scope.radioTitle = 'CPM';
          $scope.costModelValue = $scope.item.cpmValue;
        }
        $scope.tags = $scope.item.tags;
        $scope.trafficSource = {
          id: $scope.item.trafficSourceId,
          name: $scope.item.trafficSourceName
        };
        if ($scope.item['costModel'] == null) {
          $scope.item = {
            costModel: 0,
            redirectMode: 0,
            targetType: 1,
            status: '1',
          };
        }
      });
      this.title = "edit";
    } else {
      $scope.item = {
        costModel: 0,
        redirectMode: 0,
        targetType: 1,
        status: '1',
      };
      this.title = "add";
    }
    this.titleType = angular.copy(this.perfType);

    // TrafficSource
    TrafficSource.get(null, function (trafficSource) {
      $scope.trafficSources = trafficSource.data.trafficsources;
    });

    // Country
    $scope.countries = $scope.$root.countries;

    // Flow
    Flow.get(null, function (flow) {
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
      $scope.item.tags = $scope.tags;

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

    $scope.radioSelect = function (type) {
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
        $scope.item = angular.copy(flow.data);
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
    $scope.tags = [];
    if (this.item) {
      Lander.get({id: 46}, function (lander) {
        $scope.item = angular.copy(lander.data);
        $scope.tags = $scope.item.tags;
        if ($scope.item['url'] == null) {
          $scope.item = {
            url: 'http://',
            numberOfOffers: 1,
          };
        }
      });
      this.title = "edit";
    } else {
      $scope.item = {
        url: 'http://',
        numberOfOffers: 1,
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
      $scope.item.tags = $scope.tags;
      $scope.editForm.$setSubmitted();
      if ($scope.editForm.$valid) {
        Lander.save($scope.item, success);
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

  function editOfferCtrl($scope, $mdDialog, Offer, AffiliateNetwork) {
    $scope.tags = [];
    if (this.item) {
      Offer.get({id: 22}, function (offer) {
        $scope.item = angular.copy(offer.data);
        if ($scope.item['payoutMode'] == null) {
          $scope.item = {
            payoutMode: 0,
          };
        }
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
    AffiliateNetwork.get(null, function (affiliates) {
      $scope.affiliates = affiliates.data.networks;
    });

    this.titleType = angular.copy(this.perfType);

    this.cancel = $mdDialog.cancel;

    function success(item) {
      $mdDialog.hide(item);
    }

    this.save = function () {
      $scope.item.tags = $scope.tags;
      delete $scope.item.AffiliateNetworkId;
      delete $scope.item.AffiliateNetworkName;
      delete $scope.item.postbackUrl;
      $scope.editForm.$setSubmitted();
      if ($scope.editForm.$valid) {
        Offer.save($scope.item, success);
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

  function editTrafficSourceCtrl($scope, $mdDialog, TrafficSource) {
    if (this.item) {
      TrafficSource.get({id: 15}, function (trafficsource) {
        $scope.item = angular.copy(trafficsource.data);
        if (!$scope.item.params) {
          $scope.item.params = [
            {Parameter: '', Placeholder: '', Name: '', Track: ''},
            {Parameter: '', Placeholder: '', Name: '', Track: ''},
            {Parameter: '', Placeholder: '', Name: '', Track: ''},
            {Parameter: '', Placeholder: '', Name: '', Track: ''},
            {Parameter: '', Placeholder: '', Name: '', Track: ''},
            {Parameter: '', Placeholder: '', Name: '', Track: ''},
            {Parameter: '', Placeholder: '', Name: '', Track: ''},
            {Parameter: '', Placeholder: '', Name: '', Track: ''},
            {Parameter: '', Placeholder: '', Name: '', Track: ''},
            {Parameter: '', Placeholder: '', Name: '', Track: ''}
          ];
        }
      });
      this.title = "edit";
    } else {
      $scope.item = {
        impTracking: 0,
        params: [
          {Parameter: '', Placeholder: '', Name: '', Track: ''},
          {Parameter: '', Placeholder: '', Name: '', Track: ''},
          {Parameter: '', Placeholder: '', Name: '', Track: ''},
          {Parameter: '', Placeholder: '', Name: '', Track: ''},
          {Parameter: '', Placeholder: '', Name: '', Track: ''},
          {Parameter: '', Placeholder: '', Name: '', Track: ''},
          {Parameter: '', Placeholder: '', Name: '', Track: ''},
          {Parameter: '', Placeholder: '', Name: '', Track: ''},
          {Parameter: '', Placeholder: '', Name: '', Track: ''},
          {Parameter: '', Placeholder: '', Name: '', Track: ''}
        ]
      };
      $scope.params = [];
      this.title = "add";
      $scope.urlToken = '';
    }

    this.titleType = angular.copy(this.perfType);

    this.cancel = $mdDialog.cancel;

    function success(item) {
      $mdDialog.hide(item);
    }

    this.save = function () {
      $scope.item.params = JSON.stringify($scope.item.params);
      $scope.editForm.$setSubmitted();

      if ($scope.editForm.$valid) {
        TrafficSource.save($scope.item, success);
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
    $scope.urlTokenClick = function(url){
      $scope.urlToken = $scope.urlToken + url;
    };

    $scope.visible = false;
    $scope.toggleShow = function(){
      $scope.isActive = !$scope.isActive;
      $scope.visible = !$scope.visible;
    };

    $scope.selectTrafficSourceTemplate = function (ev, item) {
      $mdDialog.show({
        clickOutsideToClose: false,
        controller: ['$scope', '$mdDialog', selectTrafficSourceTemplateCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: { item: item, currentUser: $scope.currentUser },
        bindToController: true,
        targetEvent: ev,
        templateUrl: 'tpl/trafficSource-template-dialog.html',
      });
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
