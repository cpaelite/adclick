(function () {

  angular.module('app')
    .controller('ReportCtrl', [
      '$scope', '$mdDialog', '$timeout', 'columnDefinition', 'groupByOptions', 'Report', 'Preference',
      ReportCtrl
    ]);

  function ReportCtrl($scope, $mdDialog, $timeout, columnDefinition, groupByOptions, Report, Preference) {
    var perfType = $scope.$state.current.name.split('.').pop().toLowerCase();
    $scope.app.subtitle = perfType;

    $scope.groupByOptions = groupByOptions;

    // status, from, to, datetype, groupBy
    var pageStatus = {};

    var stateParams = $scope.$stateParams;
    //console.log(stateParams);

    if (stateParams.extgrpby) {
      var egb = (stateParams.extgrpby+',').split(',');
      $scope.groupBy = [perfType, egb[0], egb[1]];
      $scope.treeLevel = $scope.groupBy.filter(notEmpty).length;
    } else {
      $scope.groupBy = [perfType, '', ''];
      $scope.treeLevel = 1;
    }
    pageStatus.groupBy = angular.copy($scope.groupBy);


    if (stateParams.datetype) {
      $scope.datetype = stateParams.datetype;
      if ($scope.datetype == '0') {
        var fromDate = (stateParams.from||'').split('T');
        var toDate = (stateParams.to||'').split('T');
        $scope.fromDate = fromDate[0] || moment().format('YYYY-MM-DD');
        $scope.fromTime = fromDate[1] || '00:00';
        $scope.toDate = toDate[0] || moment().add(1, 'days').format('YYYY-MM-DD');
        $scope.toTime = toDate[1] || '00:00';
      }
    } else {
      $scope.datetype = '1';
    }
    pageStatus.datetype = $scope.datetype;
    getDateRange($scope.datetype);

    $scope.filters = [];
    groupByOptions.forEach(function(gb) {
      var val = stateParams[gb.value];
      if (val) {
        $scope.filters.push({ key: gb.value, val: val });
      }
    });

    if (stateParams.status) {
      pageStatus.status = stateParams.status;
      $scope.activeStatus = pageStatus.status;
    }

    $scope.query = {
      page: 1,
      __tk: 0
    };

    var groupMap = {};
    groupByOptions.forEach(function(group) {
      groupMap[group.value] = group;
    });

    // columns
    var cols = angular.copy(columnDefinition[perfType]).concat(columnDefinition['common']);
    // dirty fix tree view name column
    cols[0].role = 'name';
    cols[0].origKey = cols[0].key;
    cols[0].origName = cols[0].name;
    if ($scope.treeLevel > 1) {
      cols[0].key = 'name';
      cols[0].name = 'Name';
    }
    $scope.columns = cols;

    function buildSuccess(parentRow) {
      return function success(result) {
        if (result.status == 1) {
          if (!parentRow) {
            parentRow = { treeLevel: 0, expanded: true };
          }

          var group = pageStatus.groupBy[parentRow.treeLevel];
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

    function notEmpty(val) {
      return !!val;
    }

    function getList(parentRow) {
      var params = {};
      $scope.filters.forEach(function(f) { params[f.key] = f.val });
      angular.extend(params, $scope.query, pageStatus);
      delete params.__tk;
      delete params.datetype;
      delete params.groupBy;

      if (parentRow) {
        params.groupBy = pageStatus.groupBy[parentRow.treeLevel];
        params.page = 1;
        params.limit = -1;

        var group = pageStatus.groupBy[0];
        var idKey = groupMap[group].idKey;
        params[group] = parentRow.data[idKey];

        if (parentRow.treeLevel == 2) {
          var ppRow = parentRow.parentRow;
          group = pageStatus.groupBy[1];
          idKey = groupMap[group].idKey;
          params[group] = ppRow.data[idKey];
        }
      } else {
        params.groupBy = pageStatus.groupBy[0];
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
      if (!pageStatus.status) {
        $scope.activeStatus = newVal.entityType;
        pageStatus.status = newVal.entityType;
      }

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
        var exclude = [];
        $scope.filters.forEach(function(f) {
          exclude.push(f.key);
        });
        exclude.push($scope.groupBy[0]);
        if (level == 2) {
          exclude.push($scope.groupBy[1]);
        }
        return exclude.indexOf(item.value) == -1;
      }
    }
    $scope.groupbyFilter1 = filteGroupBy(1);
    $scope.groupbyFilter2 = filteGroupBy(2);

    $scope.hours = [];
    for (var i=0; i<24; ++i) {
      if (i < 10) {
        $scope.hours.push('0' + i + ':00');
      } else {
        $scope.hours.push('' + i + ':00');
      }
    }

    $scope.applySearch = function(evt) {
      $scope.treeLevel = $scope.groupBy.filter(notEmpty).length;
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

      getDateRange($scope.datetype);
      pageStatus.datetype = $scope.datetype;
      pageStatus.status = $scope.activeStatus;

      if ($scope.groupBy[0] != pageStatus.groupBy[0]) {
        pageStatus.groupBy = angular.copy($scope.groupBy);
        go($scope.groupBy[0]);
        return;
      }

      pageStatus.groupBy = angular.copy($scope.groupBy);
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

    // todo: use single menu for all rows
    // need to decorate uibDropdownDirective
    $scope.menuAppendTo = null;
    $scope.menuStatus = { isopen: false };
    $scope.openMenu = function(evt, row, role) {
      if (role == 'name') {
        $scope.menuAppendTo = evt.target;
        $scope.menuStatus.isopen = true;
      }
    };
    // fixme: are all types editable
    $scope.canEdit = true;
    $scope.drilldownFilter = function(item) {
      var exclude = [];
      exclude.push(pageStatus.groupBy[0]);
      $scope.filters.forEach(function(f) {
        exclude.push(f.key);
      });
      return exclude.indexOf(item.value) == -1;
    };
    $scope.drilldown = function(row, gb) {
      if ($scope.treeLevel > 1)
        return;
      var idKey = $scope.columns[1].key;
      $scope.filters.push({ key: pageStatus.groupBy[0], val: row.data[idKey] });

      go(gb.value);
    };

    function go(page) {
      var params = angular.copy(pageStatus);
      if ($scope.treeLevel > 1) {
        var extgrpby = pageStatus.groupBy.filter(notEmpty);
        extgrpby.shift();
        params.extgrpby = extgrpby.join(',');
      }
      delete params.groupBy;
      if (params.datetype != '0') {
        delete params.from;
        delete params.to;
      }
      $scope.filters.forEach(function(f) {
        params[f.key] = f.val;
      });
      $scope.$state.go('app.report.' + page, params);
    }

    var editTemplateUrl = 'tpl/' + perfType + '-edit-dialog.html';
    // fixme: dirty fix, rename the file
    if (perfType == 'traffic')
      editTemplateUrl = 'tpl/trafficSource-edit-dialog.html';
    if (perfType == 'affiliate')
      editTemplateUrl = 'tpl/affiliateNetwork-edit-dialog.html';

    $scope.editItem = function (ev, item) {
      var controller;
      // 不同功能的编辑请求做不同的操作
      if (perfType == 'campaign') {
        controller = ['$scope', '$state', '$mdDialog', 'Campaign', 'Flow', 'TrafficSource', editCampaignCtrl];
      } else if (perfType == 'flow') {
        //controller = ['$scope', '$mdDialog', 'Flow', editFlowCtrl];
        $scope.$state.go('app.flow');
        return;
      } else if (perfType == 'lander') {
        controller = ['$scope', '$mdDialog', 'Lander', editLanderCtrl];
      } else if (perfType == 'offer') {
        controller = ['$scope', '$mdDialog', 'Offer', 'AffiliateNetwork', editOfferCtrl];
      } else if (perfType == 'traffic') {
        controller = ['$scope', '$mdDialog', 'TrafficSource', editTrafficSourceCtrl];
      } else if (perfType == 'affiliate') {
        controller = ['$scope', '$mdDialog', 'AffiliateNetwork', editAffiliateCtrl];
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
      }).then(function () {
        getList();
      });
    };

    $scope.deleteItem = function (ev, item) {
      $mdDialog.show({
        clickOutsideToClose: true,
        controller: ['$mdDialog', 'Campaign', 'Flow', 'Lander', 'Offer', 'AffiliateNetwork', deleteCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        targetEvent: ev,
        locals: {type: perfType, item: item},
        bindToController: true,
        templateUrl: 'tpl/delete-confirm-dialog.html'
      }).then(function () {
        getList();
      });
    };

    $scope.viewColumnIsShow = false;
    $scope.viewColumnClick = function () {
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
    };
    // todo: use array for report visible columns
    $scope.applyChange = function () {
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
      $scope.preferences.reportViewColumns = angular.copy($scope.reportViewColumns);
      var preferences = {
        json: $scope.preferences
      };
      Preference.save(preferences);
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
        pageStatus.from = $scope.fromDate + 'T' + $scope.fromTime;
        pageStatus.to = $scope.toDate + 'T' + $scope.toTime;
      } else {
        pageStatus.from = fromDate + 'T00:00';
        pageStatus.to = toDate + 'T23:59';
      }
    }
  }

  function editCampaignCtrl($scope, $state, $mdDialog, Campaign, Flow, TrafficSource) {
    $scope.tags = [];
    if (this.item) {
      Campaign.get({id: this.item.data.campaignId}, function(campaign) {
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
        $scope.trafficSourceId = $scope.item.trafficSourceId;
        if ($scope.item.targetFlowId) {
          $scope.item.flow = {
            id: $scope.item.targetFlowId
          };
        }
        if ($scope.item['costModel'] == null) {
          $scope.item = defaultItem();
        }
      });
      this.title = "edit";
    } else {
      $scope.item = defaultItem();
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

    $scope.toAddFlow = function () {
      $mdDialog.hide();
      $state.go('app.flow');
    };

    this.cancel = $mdDialog.cancel;

    function defaultItem() {
      return {
        costModel: 0,
        redirectMode: 0,
        targetType: 1,
        status: '1',
      };
    }

    function success(item) {
      $mdDialog.hide(item);
    }

    this.save = function () {
      // cost model value
      if ($scope.item.costModel != 0 && $scope.item.costModel != 4) {
        $scope.item[$scope.radioTitle.toLowerCase()] = $scope.costModelValue;
      }
      $scope.item.tags = $scope.tags;

      $scope.trafficSources.forEach(function (traffic) {
        if (traffic.id == $scope.trafficSourceId) {
          $scope.item.trafficSource = JSON.stringify(traffic);
          return;
        }
      });

      delete $scope.item.trafficSourceId;
      delete $scope.item.targetFlowId;
      delete $scope.item.trafficSourceName;
      delete $scope.item['cpcValue'];
      delete $scope.item['cpaValue'];
      delete $scope.item['cpmValue'];

      if (!$scope.item['flow']) {
        $scope.item['flow']={
          type: 0,
          name: 'defaultName',
          redirectMode: 0
        };
      }

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
      Lander.get({id: this.item.data.landerId}, function (lander) {
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
      Offer.get({id: this.item.data.offerId}, function (offer) {
        $scope.item = angular.copy(offer.data);
        $scope.affiliateId = $scope.item.AffiliateNetworkId;
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
      $scope.affiliates = affiliates.data.affiliates;
    });

    this.titleType = angular.copy(this.perfType);

    this.cancel = $mdDialog.cancel;

    function success(item) {
      $mdDialog.hide(item);
    }

    this.save = function () {
      $scope.item.tags = $scope.tags;

      // AffiliateNewwork
      $scope.affiliates.forEach(function (affiliate) {
        if (affiliate.id == $scope.affiliateId) {
          $scope.item.affiliateNetwork = JSON.stringify(affiliate);
          return;
        }
      });
      
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
      TrafficSource.get({id: this.item.data.trafficId}, function (trafficsource) {
        $scope.item = angular.copy(trafficsource.data);
        if($scope.item.cost) {
          $scope.item.cost = JSON.parse($scope.item.cost);
        } else {
          $scope.item.cost = {};
        }

        if ($scope.item.externalId) {
          $scope.item.externalId = JSON.parse($scope.item.externalId);
        } else {
          $scope.item.externalId = {};
        }
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
        } else {
          $scope.item.params = JSON.parse($scope.item.params);
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
      delete $scope.item.hash;
      $scope.item.params = JSON.stringify($scope.item.params);
      $scope.item.cost = JSON.stringify($scope.item.cost);
      $scope.item.externalId = JSON.stringify($scope.item.externalId);
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

  function editAffiliateCtrl($scope, $mdDialog, AffiliateNetwork) {
    if (this.item) {
      AffiliateNetwork.get({id: this.item.data.affiliateId}, function (affiliate) {
        $scope.item = angular.copy(affiliate.data.affiliates);
        if (!$scope.item['postbackUrl']) {
          $scope.item['postbackUrl'] = 'http://';
        }
        if ($scope.item.ipWhiteList) {
          $scope.ipWhiteCheck = true;
          var ips = JSON.parse($scope.item.ipWhiteList);
          var ipList = "";
          ips.forEach(function (ip) {
            ipList = ipList + ip + "\n";
          });
          $scope.ipWhiteList = ipList;
        }
      });
      this.title = "edit";
    } else {
      $scope.item = {
        postbackUrl: 'http://'
      };
      $scope.ipWhiteCheck = false;
      this.title = "add";
    }

    this.titleType = angular.copy(this.perfType);

    this.cancel = $mdDialog.cancel;

    function success(item) {
      $mdDialog.hide(item);
    }

    this.save = function () {
      if (!$scope.ipWhiteCheck) {
        $scope.item.ipWhiteList = "[]";
      } else {
        var ips = $scope.ipWhiteList.split("\n");
        $scope.item.ipWhiteList = JSON.stringify(ips);
      }
      $scope.editForm.$setSubmitted();
      if ($scope.editForm.$valid) {
        AffiliateNetwork.save($scope.item, success);
      }
    };
    
    $scope.checkIP = function () {
      var isValid = true;
      // 验证IP格式
      var ipList = $scope.ipWhiteList;
      if (ipList) {
        var re = /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
        var ips = ipList.split('\n');
        ips.forEach(function (ip) {
          if (!re.test(ip)) {
            isValid = false;
            return;
          }
        });
        $scope.editForm.ipWhiteList.$setValidity('valid', isValid);
      } else {
        $scope.editForm.ipWhiteList.$setValidity('valid', isValid);
      }
    }

  }

  function deleteCtrl($mdDialog, Campaign, Flow, Lander, Offer, AffiliateNetwork) {
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
      } else if (type == 'affiliate') {
        deferred = AffiliateNetwork.remove({id: item.id});
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
