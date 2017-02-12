(function () {

  angular.module('app')
    .controller('ReportCtrl', [
      '$scope', '$mdDialog', '$timeout', '$cacheFactory', 'columnDefinition', 'groupByOptions', 'Report', 'Preference',
      ReportCtrl
    ]);

  angular.module('app').directive('myText', ['$rootScope', function ($rootScope) {
    return {
      link: function (scope, element) {
        $rootScope.$on('add', function (e, val) {
          var domElement = element[0];

          if (document.selection) {
            domElement.focus();
            var sel = document.selection.createRange();
            sel.text = val;
            domElement.focus();
          } else if (domElement.selectionStart || domElement.selectionStart === 0) {
            var startPos = domElement.selectionStart;
            var endPos = domElement.selectionEnd;
            var scrollTop = domElement.scrollTop;
            if (domElement.value.indexOf(val) == -1) {
              domElement.value = domElement.value.substring(0, startPos) + val + domElement.value.substring(endPos, domElement.value.length);
              domElement.selectionStart = startPos + val.length;
              domElement.selectionEnd = startPos + val.length;
              domElement.scrollTop = scrollTop;
            }
            domElement.focus();
          } else {
            domElement.value += val;
            domElement.focus();
          }

        });
      }
    }
  }]);

  function ReportCtrl($scope, $mdDialog, $timeout, $cacheFactory, columnDefinition, groupByOptions, Report, Preference) {
    var perfType = $scope.$state.current.name.split('.').pop().toLowerCase();
    $scope.app.subtitle = perfType;

    $scope.groupByOptions = groupByOptions;

    var cache = $cacheFactory.get('report-page');
    if (!cache) {
      cache = $cacheFactory('report-page', {capacity:100});
    }

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
        var cacheKey = gb.value + ':' + val;
        // todo: get name from server if not in cache
        var cacheName = cache.get(cacheKey) || val;
        $scope.filters.push({ key: gb.value, val: val, name: cacheName });
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
    var cols = angular.copy(columnDefinition[perfType]);
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
          var idKey = groupMap[group].idKey;
          var nameKey = groupMap[group].nameKey;

          var rows = [];
          result.data.rows.forEach(function(row) {
            if ($scope.treeLevel > 1) {
              row.name = row[nameKey];
            }
            rows.push({
              id: row[idKey],
              name: row[nameKey],
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

        var pgrp = pageStatus.groupBy[parentRow.treeLevel-1];
        params[pgrp] = parentRow.id;

        if (parentRow.treeLevel == 2) {
          var ppRow = parentRow.parentRow;
          var ppgrp = pageStatus.groupBy[0];
          params[ppgrp] = ppRow.id;
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

    $scope.deleteFilter = function(filter) {
      var idx = $scope.filters.indexOf(filter);
      $scope.filters.splice(idx, 1);
      $scope.query.page = 1;
      $scope.query.__tk += 1;
    };

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
    $scope.canEdit = ['campaign', 'flow', 'lander', 'offer', 'traffic', 'affiliate'].indexOf(perfType) >= 0;
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

      var group = pageStatus.groupBy[0];

      var cacheKey = group + ':' + row.id;
      cache.put(cacheKey, row.name);

      $scope.filters.push({ key: group, val: row.id });

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

    $scope.editItem = function (ev, item, duplicate) {
      var controller;
      // 不同功能的编辑请求做不同的操作
      if (perfType == 'campaign') {
        controller = ['$scope', '$rootScope', '$mdDialog', '$timeout', '$q', 'Campaign', 'Flow', 'TrafficSource', 'urlParameter', editCampaignCtrl];
      } else if (perfType == 'flow') {
        var params = {};
        if (item) {
          params.id = item.id;
          if (duplicate)
            params.dup = 1;
        }
        $scope.$state.go('app.flow', params);
        return;
      } else if (perfType == 'lander') {
        controller = ['$scope', '$rootScope', '$mdDialog', 'Lander', 'urlParameter', editLanderCtrl];
      } else if (perfType == 'offer') {
        controller = ['$scope', '$mdDialog', '$rootScope', '$q', 'Offer', 'AffiliateNetwork', 'urlParameter', 'DefaultPostBackUrl', editOfferCtrl];
      } else if (perfType == 'traffic') {
        controller = ['$scope', '$mdDialog', '$rootScope', 'TrafficSource', 'urlParameter', editTrafficSourceCtrl];
      } else if (perfType == 'affiliate') {
        controller = ['$scope', '$mdDialog', '$timeout', 'AffiliateNetwork', editAffiliateCtrl];
      }

      $mdDialog.show({
        clickOutsideToClose: false,
        controller: controller,
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {item: item, perfType: perfType, duplicate: !!duplicate},
        bindToController: true,
        targetEvent: ev,
        templateUrl: editTemplateUrl
      }).then(function () {
        getList();
      });
    };

    $scope.deleteItem = function (ev, item) {
      if (!$scope.canEdit) {
        return;
      }
      $mdDialog.show({
        clickOutsideToClose: true,
        controller: ['$mdDialog', '$injector', deleteCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        targetEvent: ev,
        locals: {type: perfType, item: item.id},
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
    $scope.checkboxInput = function($event){
      $event.stopPropagation();
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

  function editCampaignCtrl($scope, $rootScope, $mdDialog , $timeout, $q, Campaign, Flow, TrafficSource, urlParameter) {
    $scope.tags = [];

    // init load data
    var initPromises = [], prms;
    if (this.item) {
      var theCampaign;
      prms = Campaign.get({id: this.item.data.campaignId}, function(campaign) {
        theCampaign = campaign.data;
      }).$promise;
      initPromises.push(prms);

      this.title = "edit";
    } else {
      $scope.item = defaultItem();
      this.title = "add";
    }

    this.titleType = angular.copy(this.perfType);

    // TrafficSource
    var allTraffic;
    prms = TrafficSource.get(null, function (trafficSource) {
      //$scope.trafficSources = trafficSource.data.trafficsources;
      allTraffic = trafficSource.data.trafficsources;
    }).$promise;
    initPromises.push(prms);

    // Country
    $scope.countries = $scope.$root.countries;

    // Flow
    var allFlow;
    prms = Flow.get(null, function (flow) {
      //$scope.flows = flow.data.flows;
      allFlow = flow.data.flows;
    }).$promise;
    initPromises.push(prms);

    function initSuccess() {
      $scope.trafficSources = allTraffic;
      $scope.flows = allFlow;
      var isDuplicate = this.duplicate;
      if (isDuplicate) delete $scope.item.id;
      if (theCampaign) {
        $scope.item = theCampaign;
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
        $scope.trafficSourceId = $scope.item.trafficSourceId.toString();
        if ($scope.item.targetFlowId) {
          $scope.item.flow = {
            id: $scope.item.targetFlowId.toString()
          };
          showFlow();
        }
        if ($scope.item['costModel'] == null) {
          $scope.item = defaultItem();
        }
      } else {
        $scope.trafficSourceId = allTraffic.length > 0 ? allTraffic[0].id: null;
      }

      $scope.$watch('trafficSourceId', function (newValue, oldValue) {
        if (!newValue) {
          return;
        }
        $scope.trafficSources.forEach(function (traffic) {
          if (traffic.id == newValue) {
            $scope.impTracking = traffic.impTracking;

            if (!$scope.item.impPixelUrl) {
              return;
            }

            var params = JSON.parse(traffic.params);
            var impParam = "";
            params.forEach(function (param) {
              if (param.Placeholder) {
                impParam = impParam + param.Parameter + "=" + param.Placeholder + "&";
              }
            });

            if (!impParam)
              return;

            impParam = impParam.substring(0, impParam.length-1);
            $scope.impPixelUrl = $scope.item.impPixelUrl + "?" + impParam;
            return;
          }

        });
      });
      if (!$scope.item.targetUrl) {
        $scope.item.targetUrl = "http://";
      }
    }

    $q.all(initPromises).then(initSuccess);

    function calculateRelativeWeight(list, isValid) {
      var total = 0;
      if (!list) {
        return;
      }
      list.forEach(function(item) {
        if (isValid(item))
          total += item.weight | 0;
      });
      list.forEach(function(item) {
        if (isValid(item)) {
          item.relativeWeight = 100 * item.weight / total;
        } else {
          item.relativeWeight = -1;
        }
      });
    }

    // Flow preview 
    // $scope.secondIsShow = true ;
    $scope.toggleClick = function(type){
      type.isShow = !type.isShow;
    };

    $scope.offerItem = {};
    $scope.landerItem = {};

    // campaign copy btn
    $scope.btnWord1 = "Clipboard";
    $scope.itemUrlClick = function(){
      $scope.btnWord1 = "Copied";
      $timeout(function() {
        $scope.btnWord1 = "Clipboard";
      }, 2000);
    };
    $scope.btnWord2 = "Clipboard";
    $scope.impPixelUrlClick = function(){
      $scope.btnWord2 = "Copied";
      $timeout(function() {
        $scope.btnWord2 = "Clipboard";
      }, 2000);
    };

    function showFlow() {
      $scope.ztreeShow = true;
      // Get Flow by Id
      Flow.get({id: $scope.item.flow.id}, function (flow) {
        $scope.flow = flow.data;

        $scope.flow.rules.forEach(function(rule) {
          calculateRelativeWeight(rule.paths, function(item) { return item; });

          rule.paths.forEach(function(path) {
            calculateRelativeWeight(path.landers, function(item) { return item; });
            calculateRelativeWeight(path.offers, function(item) { return item; });
          });
        });
      });
    }

    $scope.$watch('item.flow.id', function (newValue, oldValue) {
      if (newValue != oldValue) {
        showFlow();
      }
    });

    $scope.toAddFlow = function () {
      $mdDialog.hide();
      $scope.$parent.$state.go('app.flow');
    };

    $scope.toEditFlow = function () {
      $mdDialog.hide();
      $scope.$parent.$state.go('app.flow', {id: $scope.item.flow.id});
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
      var campaign = item.data;
      $scope.item.url = campaign.url;
      $scope.item.impPixelUrl = campaign.impPixelUrl;
      if ($scope.item.id) {
        $mdDialog.hide();
      } else {
        $scope.item.id = campaign.id;
      }
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
      delete $scope.item.impPixelUrl;
      delete $scope.item.url;
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

    $scope.urlItem = urlParameter["campaign"];
    $scope.urlTokenClick = function (url) {
      $rootScope.$broadcast('add', url);
    };

    $scope.isDisabled = false;
  }

  function editLanderCtrl($scope, $rootScope, $mdDialog, Lander, urlParameter) {
    $scope.tags = [];
    if (this.item) {
      var isDuplicate = this.duplicate;
      Lander.get({id: this.item.data.landerId}, function (lander) {
        $scope.item = angular.copy(lander.data);
        if (isDuplicate) delete $scope.item.id;
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
    $scope.urlItem = urlParameter["lander"];
    $scope.urlTokenClick = function (url) {
      $rootScope.$broadcast('add', url);
    };
  }

  function editOfferCtrl($scope, $mdDialog, $rootScope, $q, Offer, AffiliateNetwork, urlParameter, DefaultPostBackUrl) {
    $scope.tags = [];

    // init load data
    var initPromises = [], prms;

    if (this.item) {
      var theOffer;
      prms = Offer.get({id: this.item.data.offerId}, function(offer) {
        theOffer = offer.data;
      }).$promise;
      initPromises.push(prms);

      this.title = "edit";
    } else {
      $scope.item = {
        payoutMode: 0,
        url: 'http://'
      };
      this.title = "add";
    }

    // Country
    $scope.countries = $scope.$root.countries;

    var defaultPostBackUrl;
    prms = DefaultPostBackUrl.get(null, function (postbackUrl) {
      defaultPostBackUrl = postbackUrl.data.defaultPostBackUrl;
    });
    initPromises.push(prms);

    var allAffiliate;
    prms = AffiliateNetwork.get(null, function (affiliates) {
      allAffiliate = affiliates.data.affiliates;
    }).$promise;
    initPromises.push(prms);

    function initSuccess() {
      $scope.affiliates = allAffiliate;
      var isDuplicate = this.duplicate;
      if (isDuplicate) delete $scope.item.id;
      if (theOffer) {
        $scope.item = theOffer;
        $scope.affiliateId = theOffer.AffiliateNetworkId.toString();
        $scope.tags = $scope.item.tags;
        if ($scope.item['payoutMode'] == null) {
          $scope.item = {
            payoutMode: 0,
          };
        }
        if ($scope.item['url'] == null) {
          $scope.item = {
            url: 'http://',
            numberOfOffers: 1,
          };
        }
      }

      $scope.$watch('affiliateId', function (newValue, oldValue) {
        if (!newValue) {
          $scope.item.postbackUrl = defaultPostBackUrl;
          return;
        }
        $scope.affiliates.forEach(function (affiliate) {
          if (affiliate.id == newValue) {
            if (affiliate.postbackUrl) {
              $scope.item.postbackUrl = affiliate.postbackUrl;
            } else {
              $scope.item.postbackUrl = defaultPostBackUrl;
            }
            return;
          }

        });
      });

    }

    $q.all(initPromises).then(initSuccess);

    this.titleType = angular.copy(this.perfType);

    this.cancel = $mdDialog.cancel;

    function success(item) {
      $mdDialog.hide(item);
    }

    this.save = function () {
      $scope.item.tags = $scope.tags;

      // fill item.affiliateNetwork
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
    $scope.urlItem = urlParameter["offer"];
    $scope.urlTokenClick = function (url) {
      $rootScope.$broadcast('add', url);
    };
  }

  function editTrafficSourceCtrl($scope, $mdDialog, $rootScope, TrafficSource, urlParameter) {
    if (this.item) {
      var isDuplicate = this.duplicate;
      TrafficSource.get({id: this.item.data.trafficId}, function (trafficsource) {
        $scope.item = angular.copy(trafficsource.data);
        if (isDuplicate) delete $scope.item.id;
        if($scope.item.cost) {
          $scope.cost = JSON.parse($scope.item.cost);
        } else {
          $scope.cost = {};
        }

        if ($scope.item.externalId) {
          $scope.externalId = JSON.parse($scope.item.externalId);
        } else {
          $scope.externalId = {};
        }
        if (!$scope.item.params) {
          $scope.params = [
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
          $scope.params = JSON.parse($scope.item.params);
        }
      });
      this.title = "edit";
    } else {
      $scope.item = {
        impTracking: 0,
      };
      $scope.params = [
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
      this.title = "add";
      $scope.urlToken = '';
    }

    this.titleType = angular.copy(this.perfType);

    this.cancel = $mdDialog.cancel;

    function success(item) {
      $mdDialog.hide(item);
    }

    this.save = function () {
      $scope.item.params = JSON.stringify($scope.params);
      $scope.item.cost = JSON.stringify($scope.cost);
      $scope.item.externalId = JSON.stringify($scope.externalId);
      $scope.editForm.$setSubmitted();

      if ($scope.editForm.$valid) {
        TrafficSource.save($scope.item, success);
      }
    };

    $scope.urlItem = urlParameter["traffic"];
    $scope.urlTokenClick = function(url){
      $rootScope.$broadcast('add', url);
    };

    $scope.visible = false;
    $scope.toggleShow = function(){
      $scope.isActive = !$scope.isActive;
      $scope.visible = !$scope.visible;
    };

    $scope.$watch('externalId.Parameter', function (newValue, oldValue) {
      if(!newValue) {
        $scope.externalId = {
          Placeholder: null
        };
        return;
      }
      var placeholder = $scope.externalId.Placeholder;
      if (placeholder) {
        placeholder = placeholder.substring(1, placeholder.length - 1);
      }
      if (placeholder == oldValue) {
        $scope.externalId.Placeholder = '{' + newValue + '}';
      }
    });

    $scope.$watch('cost.Parameter', function (newValue, oldValue) {
      if (!newValue){
        $scope.cost = {
          Placeholder: null
        };
        return;
      }

      var placeholder = $scope.cost.Placeholder;
      if (placeholder) {
        placeholder = placeholder.substring(1, placeholder.length - 1);
      }
      if (placeholder == oldValue) {
        $scope.cost.Placeholder = '{' + newValue + '}';
      }
    });

    $scope.$watch('params', function (newValue, oldValue) {
      if (!newValue) {
        return;
      }
      newValue.forEach(function (value, index) {
        if (!value.Parameter) {
          $scope.params[index].Placeholder = "";
          $scope.params[index].Name = "";
          return;
        }

        var placeholder = value.Placeholder;
        var name = value.Name;
        if (placeholder) {
          placeholder = placeholder.substring(1, placeholder.length - 1);
        }

        if (!oldValue || placeholder == oldValue[index].Parameter) {
          $scope.params[index].Placeholder = '{' + newValue[index].Parameter + '}';
        }

        if (!oldValue || name == oldValue[index].Parameter) {
          $scope.params[index].Name = newValue[index].Parameter;
        }

      });
    }, true);

    $scope.selectTrafficSourceTemplate = function (ev, item) {
      $mdDialog.show({
        multiple: true,
        skipHide: true,
        clickOutsideToClose: false,
        controller: ['$scope', '$mdDialog', 'TrafficTemplate', trafficSourceTemplateCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: { item: item, currentUser: $scope.currentUser },
        bindToController: true,
        targetEvent: ev,
        templateUrl: 'tpl/trafficSource-template-dialog.html',
      }).then(function(data){
        $scope.item.name = data.name;
        $scope.item.postbackUrl = data.postbackUrl;
        $scope.params = JSON.parse(data.params);
        $scope.cost = JSON.parse(data.cost);
        $scope.externalId = JSON.parse(data.externalId);
        $scope.visible = true;
      });
    };

  }

  function trafficSourceTemplateCtrl($scope, $mdDialog, TrafficTemplate) {
    TrafficTemplate.get(null, function (trafficTpl) {
      $scope.trafficTemplateLists = trafficTpl.data.lists;
    });

    $scope.selected = 0;
    $scope.templateListClick = function($index){
      $scope.selected = $index;
    };

    this.save = function () {
      var trafficTpl = $scope.trafficTemplateLists[$scope.selected];
      $mdDialog.hide(trafficTpl);
    };

    this.hide = function() {
      $mdDialog.hide();
    };

    this.cancel = function() {
      $mdDialog.cancel();
    };

  }

  function editAffiliateCtrl($scope, $mdDialog, $timeout, AffiliateNetwork) {
    if (this.item) {
      var isDuplicate = this.duplicate;
      AffiliateNetwork.get({id: this.item.data.affiliateId}, function (affiliate) {
        $scope.item = angular.copy(affiliate.data.affiliates);
        if (isDuplicate) delete $scope.item.id;
        if ($scope.item.ipWhiteList) {
          var ips = JSON.parse($scope.item.ipWhiteList);
          if (ips.length) {
            $scope.ipWhiteCheck = true;
            var ipList = ips.join('\n');
            $scope.ipWhiteList = ipList;
          }
        }
      });
      this.title = "edit";
    } else {
      $scope.item = {};
      $scope.ipWhiteCheck = false;
      this.title = "add";
    }

    // affiliate copy btn
    $scope.btnWord = "Clipboard";
    $scope.itemUrlClick = function(){
      $scope.btnWord = "Copied";
      $timeout(function() {
        $scope.btnWord = "Clipboard";
      }, 2000);
    };

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

    $scope.trustedAffiliateNetworks = function (ev, item) {
      $mdDialog.show({
        multiple: true,
        skipHide: true,
        clickOutsideToClose: false,
        controller: ['$scope', '$mdDialog', 'AffiliateTemplate', affiliateNetworkCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: { item: item, currentUser: $scope.currentUser },
        bindToController: true,
        targetEvent: ev,
        templateUrl: 'tpl/trusted-affiliate-networks-dialog.html',
      }).then(function(data){
        $scope.item.postbackUrl = data.postbackurl;
        $scope.item.name = data.name;
      });
    };

  }

  function affiliateNetworkCtrl($scope, $mdDialog, AffiliateTemplate) {

    AffiliateTemplate.get(null, function (affiliateTpl) {
      $scope.trafficTemplateLists = affiliateTpl.data.lists;

    });

    $scope.selected = 0;
    $scope.panelIsShow = 0;
    $scope.isDown = 0;
    $scope.templateListClick = function($index){
      $scope.selected = $index;
      $scope.panelIsShow = $index;
      $scope.isDown = $index;
    };

    this.hide = function() {
      $mdDialog.hide();
    };

    this.save = function(){
      var traffiliateTpl = $scope.trafficTemplateLists[$scope.selected];
      $mdDialog.hide(traffiliateTpl);
    };

    this.cancel = function() {
      $mdDialog.cancel();
    };
  }

  function deleteCtrl($mdDialog, $injector) {
    this.title = "delete";
    this.content = 'warnDelete';

    this.cancel = $mdDialog.cancel;

    var type = this.type;
    var resourceName;
    if (type == 'affiliate') {
      resourceName = 'AffiliateNetwork';
    } else {
      resourceName = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }

    function deleteItem(item) {
      return $injector.get(resourceName).remove({id: item}).$promise;
    }

    this.onprocess = false;
    this.ok = function () {
      this.onprocess = true;
      deleteItem(this.item).then(success, error);
    };

    function success() {
      console.log("success delete");
      this.onprocess = false;
      $mdDialog.hide();
    }

    function error() {
      this.onprocess = false;
      this.error = 'Error occured when delete.';
    }
  }

})();
