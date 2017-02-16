(function () {

  angular.module('app')
    .controller('ReportCtrl', [
      '$scope', '$mdDialog', '$timeout', 'reportCache', 'columnDefinition', 'groupByOptions', 'Report', 'Preference',
      ReportCtrl
    ]);

  angular.module('app').directive('myText', ['$rootScope', function ($rootScope) {
    return {
      link: function (scope, element) {
        $rootScope.$on('add', function (e, val, attriName) {
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
              //domElement.value = domElement.value.substring(0, startPos) + val + domElement.value.substring(endPos, domElement.value.length);
              scope.item[attriName] = domElement.value.substring(0, startPos) + val + domElement.value.substring(endPos, domElement.value.length);
              domElement.selectionStart = startPos + val.length;
              domElement.selectionEnd = startPos + val.length;
              domElement.scrollTop = scrollTop;
            }
            domElement.focus();
          } else {
            //domElement.value += val;
            scope.item[attriName] += val;
            domElement.focus();
          }

        });
      }
    }
  }]);

  function ReportCtrl($scope, $mdDialog, $timeout, reportCache, columnDefinition, groupByOptions, Report, Preference) {
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
        $scope.fromDate = fromDate[0];
        $scope.fromTime = fromDate[1];
        $scope.toDate = toDate[0];
        $scope.toTime = toDate[1];
      }
    } else {
      $scope.datetype = '1';
    }
    $scope.fromDate = $scope.fromDate || moment().format('YYYY-MM-DD');
    $scope.fromTime = $scope.fromTime || '00:00';
    $scope.toDate = $scope.toDate || moment().add(1, 'days').format('YYYY-MM-DD');
    $scope.toTime = $scope.toTime || '00:00';
    pageStatus.datetype = $scope.datetype;
    getDateRange($scope.datetype);

    $scope.filters = [];
    groupByOptions.forEach(function(gb) {
      var val = stateParams[gb.value];
      if (val) {
        var cacheKey = gb.value + ':' + val;
        // todo: get name from server if not in cache
        var cacheName = reportCache.get(cacheKey) || val;
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
      reportCache.put(cacheKey, row.name);

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

    $scope.editItem = function (ev, item, duplicate, cache) {
      var controller;
      // 不同功能的编辑请求做不同的操作
      if (perfType == 'campaign') {
        controller = ['$scope', '$rootScope', '$mdDialog', '$timeout', '$q', 'reportCache', 'Campaign', 'Flow', 'TrafficSource', 'urlParameter', 'Tag', editCampaignCtrl];
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
        controller = ['$scope', '$rootScope', '$mdDialog', 'Lander', 'urlParameter', 'Tag', editLanderCtrl];
      } else if (perfType == 'offer') {
        controller = ['$scope', '$mdDialog', '$rootScope', '$q', 'Offer', 'AffiliateNetwork', 'urlParameter', 'DefaultPostBackUrl', 'Tag', editOfferCtrl];
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
        locals: {item: item, perfType: perfType, duplicate: !!duplicate, cache: cache},
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
        locals: {type: perfType, item: item.data},
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

    var params = $scope.$state.params[perfType];
    if(params && params.isShowAdd) {
      $scope.editItem();
    }

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
        pageStatus.from = moment($scope.fromDate).format('YYYY-MM-DD') + 'T' + $scope.fromTime;
        pageStatus.to = moment($scope.toDate).format('YYYY-MM-DD') + 'T' + $scope.toTime;
      } else {
        pageStatus.from = fromDate + 'T00:00';
        pageStatus.to = toDate + 'T23:59';
      }
    }

    if (perfType == 'campaign') {
      var cache = reportCache.get('campaign-cache');
      if (cache) {
        reportCache.remove('campaign-cache');
        $scope.editItem(null, {}, false, cache);
      }
    }
  }

  function editCampaignCtrl($scope, $rootScope, $mdDialog , $timeout, $q, reportCache, Campaign, Flow, TrafficSource, urlParameter, Tag) {
    var prefix = '', prefixCountry = '', prefixTraffic = '';
    initTags($scope, Tag);
    // init load data
    var initPromises = [], prms;
    var theCampaign;
    if (this.cache) {
      theCampaign = this.cache;
      this.title = theCampaign.id ? 'edit' : 'add';
    } else if (this.item) {
      var isDuplicate = this.duplicate;
      prms = Campaign.get({id: this.item.data.campaignId}, function(campaign) {
        theCampaign = campaign.data;
        if (isDuplicate) delete theCampaign.id;
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
      if (theCampaign) {
        $scope.item = theCampaign;
        $scope.impPixelUrl = $scope.item.impPixelUrl;
        $scope.campaignUrl = $scope.item.url;
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
        if ($scope.item.trafficSourceId)
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
        $scope.countries.forEach(function(v) {
          if(v.value == $scope.item.country) {
            prefixCountry = v.display + ' - ';
            return;
          }
        });
        $scope.trafficSources.forEach(function(v) {
          if(v.id == $scope.item.trafficSourceId) {
            prefixTraffic = v.name + ' - ';
            return;
          }
        });
        $scope.oldName = $scope.item.name;
        prefix = prefixTraffic + prefixCountry;
      } else {
        prefixCountry = 'Global - ';
        prefixTraffic = allTraffic.length > 0 ? allTraffic[0].name + ' - ' : '';
        prefix = $scope.item.name = $scope.oldName = prefixTraffic + prefixCountry;
        $scope.trafficSourceId = allTraffic.length > 0 ? allTraffic[0].id.toString(): null;
      }

      $scope.$watch('trafficSourceId', function (newValue, oldValue) {
        if (!newValue) {
          return;
        }
        $scope.trafficSources.forEach(function (traffic) {
          if (traffic.id == newValue) {
            $scope.impTracking = traffic.impTracking;
            $scope.trafficPostbackUrl = traffic.postbackUrl;
            $scope.trafficPixelRedirectUrl = traffic.pixelRedirectUrl;
            spliceUrlParams(traffic);
            return;
          }

        });
      });
    }

    function spliceUrlParams(traffic) {
      var params = JSON.parse(traffic.params);
      var impParam = "";
      params.forEach(function (param) {
        if (param.Placeholder) {
          impParam = impParam + param.Parameter + "=" + param.Placeholder + "&";
        }
      });

      var cost = "";
      if (traffic.cost) {
        cost = JSON.parse(traffic.cost);
      }
      if (cost) {
        impParam = impParam + cost.Parameter + "=" + cost.Placeholder + "&";
      }
      var external = "";
      if (traffic.externalId) {
        external = JSON.parse(traffic.externalId);
      }
      if (external) {
        impParam = impParam + external.Parameter + "=" + external.Placeholder + "&";
      }

      if (impParam) {
        impParam = "?" + impParam;
      }

      impParam = impParam.substring(0, impParam.length-1);

      if (traffic.impTracking) {
        $scope.campaignUrl = $scope.item.url;
        if ($scope.impPixelUrl) {
          $scope.impPixelUrl = $scope.item.impPixelUrl + impParam;
        }
      } else {
        $scope.impPixelUrl = $scope.item.impPixelUrl;
        if ($scope.campaignUrl) {
          $scope.campaignUrl = $scope.item.url + impParam;
        }
      }
    }

    $q.all(initPromises).then(initSuccess);

    $scope.nameChanged = function(name) {
      if(name == undefined || name.length < prefix.length) {
        $scope.item.name = prefix;
      } else if(name.indexOf(prefix) != 0) {
        var sub = name.substr(0, prefix.length);
        var arr1 = prefix.split('');
        var arr2 = sub.split('');
        var inputText = '';
        for(var i = 0, l = prefix.length; i < l; i++) {
          if(arr1[i] !== arr2[i]) {
            inputText = arr2[i];
            break;
          }
        }
        if(name.length < $scope.oldName.length) {
          $scope.item.name = $scope.oldName.substr(0, $scope.oldName.length - 1);
        } else {
          $scope.item.name = $scope.oldName + inputText;
        }
      }
      $scope.oldName = $scope.item.name;
    };

    $scope.countryChanged = function(country) {
      $scope.countries.forEach(function(v) {
        if(v.value == country) {
          prefixCountry = v.display + ' - ';
          return;
        }
      });
      var preStr = prefixTraffic + prefixCountry;
      $scope.item.name = preStr + $scope.item.name.substr(prefix.length);
      $scope.oldName = preStr + $scope.oldName.substr(prefix.length);
      prefix = preStr;
    }

    $scope.trafficSourceChanged = function(id) {
      $scope.trafficSources.forEach(function(v) {
        if(v.id == id) {
          prefixTraffic = v.name + ' - ';
          return;
        }
      });
      var preStr = prefixTraffic + prefixCountry;
      $scope.item.name = preStr + $scope.item.name.substr(prefix.length);
      $scope.oldName = preStr + $scope.oldName.substr(prefix.length);
      prefix = preStr;
    };

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

    // campaign override url
    $scope.btnOverride1 = "Override";
    $scope.postbackurlOverride = function () {
      if ($scope.btnOverride1 == "Override") {
        $scope.btnOverride1 = "Restore";
        $scope.trafficPostbackUrl = "";
      } else if ($scope.btnOverride1 == "Restore") {
        $scope.btnOverride1 = "Override";
        getTraffic("postbackUrl");
      }
    };
    $scope.btnOverride2 = "Override";
    $scope.pixelredirecturlOverride = function () {
      if ($scope.btnOverride2 == "Override") {
        $scope.btnOverride2 = "Restore";
        $scope.trafficPixelRedirectUrl = "";
      } else if ($scope.btnOverride2 == "Restore") {
        $scope.btnOverride2 = "Override";
        getTraffic("pixelRedirectUrl");
      }
    };

    function getTraffic(urlName) {
      $scope.trafficSources.forEach(function (traffic, index) {
        if (traffic.id == $scope.trafficSourceId) {
          $scope.item.trafficSource = JSON.stringify(traffic);
          var tra = {
            id: traffic.id,
            hash: traffic.hash,
            name: traffic.name
          };
          if (urlName == "postbackUrl") {
            tra.postbackUrl = $scope.trafficPostbackUrl
          } else if (urlName == "pixelRedirectUrl") {
            tra.pixelRedirectUrl = $scope.trafficPixelRedirectUrl
          }
          TrafficSource.save(tra, function (result) {
            $scope.trafficSources[index].postbackUrl = $scope.trafficPostbackUrl;
            $scope.trafficSources[index].pixelRedirectUrl = $scope.trafficPixelRedirectUrl;
          });
        }
      });
    }


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

    function saveCacheData() {
      var cacheData = angular.copy($scope.item);
      delete cacheData.flow;
      cacheData.trafficSourceId = $scope.trafficSourceId;
      cacheData.targetFlowId = $scope.item.flow.id;
      if ($scope.item.costModel != 0 && $scope.item.costModel != 4) {
        cacheData[$scope.radioTitle.toLowerCase() + 'Value'] = $scope.costModelValue;
      }
      cacheData.tags = $scope.tags;
      reportCache.put('campaign-cache', cacheData);
    }

    $scope.toAddFlow = function () {
      $mdDialog.hide();
      saveCacheData();
      $scope.$parent.$state.go('app.flow', {frcpn: 1});
    };

    $scope.toEditFlow = function () {
      $mdDialog.hide();
      saveCacheData();
      $scope.$parent.$state.go('app.flow', {id: $scope.item.flow.id, frcpn: 1});
    };

    this.cancel = function() {
      if (!$scope.editForm.$dirty) {
        $mdDialog.cancel();
      } else {
        closeConfirmDialog($mdDialog);
      }
    };


    function defaultItem() {
      return {
        costModel: 0,
        redirectMode: 0,
        targetType: 1,
        status: '1',
      };
    }

    $scope.validateUrl = function () {
      var isValid = true;
      if (!$scope.item.targetUrl) {
        return;
      }
      if ($scope.item.targetUrl.indexOf('http://') == -1) {
        $scope.item.targetUrl = "http://" + $scope.item.targetUrl;
      }
      var strRegex = '^(http://)(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*([a-zA-Z0-9\&%_\./-~-]*)?$';
      var re=new RegExp(strRegex);
      if (!re.test($scope.item.targetUrl)) {
        isValid = false;
      }
      $scope.editForm.targetUrl.$setValidity('urlformat', isValid);
    };

    function success(item) {
      var campaign = item.data;
      $scope.item.url = campaign.url;
      $scope.item.impPixelUrl = campaign.impPixelUrl;
      $scope.item.hash = campaign.hash;
      $scope.impPixelUrl = campaign.impPixelUrl;
      $scope.campaignUrl = campaign.url;

      var traffic = JSON.parse($scope.item.trafficSource);
      spliceUrlParams(traffic);

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
      $rootScope.$broadcast('add', url, "targetUrl");
    };

    $scope.isDisabled = false;
    $scope.addTrafficSource = function() {
      $mdDialog.cancel();
      $scope.$parent.$state.go('app.report.traffic', {
        'traffic': {
          'isShowAdd': true
        }
      });
    };

  }

  function editLanderCtrl($scope, $rootScope, $mdDialog, Lander, urlParameter, Tag) {
    var prefix = 'Global - ';
    initTags($scope, Tag);
    if (this.item) {
      var isDuplicate = this.duplicate;
      Lander.get({id: this.item.data.landerId}, function (lander) {
        $scope.item = angular.copy(lander.data);
        if (isDuplicate) delete $scope.item.id;
        $scope.tags = $scope.item.tags;
        $scope.item = {
          numberOfOffers: 1,
        };
        if($scope.item.country) {
          $scope.countries.forEach(function(v) {
            if(v.value == $scope.item.country) {
              prefix = v.display + ' - ';
              return;
            }
          });
        }
        $scope.oldName = $scope.item.name;
      });
      this.title = "edit";
    } else {
      $scope.item = {
        numberOfOffers: 1
      };
      this.title = "add";
      $scope.item.name = prefix;
      $scope.oldName = $scope.item.name;
    }
    
    this.titleType = angular.copy(this.perfType);
    $scope.nameChanged = function() {
      if($scope.item.name == undefined || $scope.item.name.length < prefix.length) {
        $scope.item.name = prefix;
      } else if ($scope.item.name.indexOf(prefix) != 0) {
        var sub = $scope.item.name.substr(0, prefix.length);
        var arr1 = prefix.split('');
        var arr2 = sub.split('');
        var inputText = '';
        for(var i = 0, l = prefix.length; i < l; i++) {
          if(arr1[i] !== arr2[i]) {
            inputText = arr2[i];
            break;
          }
        }
        if($scope.item.name.length < $scope.oldName.length) {
          $scope.item.name = $scope.oldName.substr(0, $scope.oldName.length - 1);
        } else {
          $scope.item.name = $scope.oldName + inputText;
        }
      }
      $scope.oldName = $scope.item.name;
    };
    $scope.countryChanged = function(country) {
      var countryName = '';
      $scope.countries.forEach(function(v) {
        if(v.value == country) {
          countryName = v.display;
          return;
        }
      });
      var preStr = countryName + ' - ';
      $scope.item.name = preStr + $scope.item.name.substr(prefix.length);
      $scope.oldName = preStr + $scope.oldName.substr(prefix.length);
      prefix = preStr;
    }
    
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
      $rootScope.$broadcast('add', url, "url");
    };

    $scope.validateUrl = function () {
      var isValid = true;
      if (!$scope.item.url) {
        return;
      }
      if ($scope.item.url.indexOf('http://') == -1) {
        $scope.item.url = "http://" + $scope.item.url;
      }
      var strRegex = '^(http://)(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*([a-zA-Z0-9\&%_\./-~-]*)?$';
      var re=new RegExp(strRegex);
      if (!re.test($scope.item.url)) {
        isValid = false;
      }
      $scope.editForm.url.$setValidity('urlformat', isValid);
    };

  }

  function editOfferCtrl($scope, $mdDialog, $rootScope, $q, Offer, AffiliateNetwork, urlParameter, DefaultPostBackUrl, Tag) {
    var prefix = '', prefixCountry = '', prefixAffiliate = '';
    initTags($scope, Tag);
    // init load data
    var initPromises = [], prms;

    if (this.item) {
      var isDuplicate = this.duplicate;
      var theOffer;
      prms = Offer.get({id: this.item.data.offerId}, function(offer) {
        theOffer = offer.data;
        if (isDuplicate) delete theOffer.id;
      }).$promise;
      initPromises.push(prms);

      this.title = "edit";
    } else {
      $scope.item = {
        payoutMode: 0
      };
      $scope.affiliateId = "0";
      this.title = "add";
      prefixCountry = 'Global - ';
      prefix = $scope.item.name = $scope.oldName = prefixCountry;
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
      if (theOffer) {
        $scope.item = theOffer;
        $scope.affiliateId = theOffer.AffiliateNetworkId.toString();
        $scope.tags = $scope.item.tags;
        if ($scope.item['payoutMode'] == null) {
          $scope.item = {
            payoutMode: 0,
          };
        }
        $scope.item = {
          numberOfOffers: 1,
        };
        $scope.countries.forEach(function(v) {
          if(v.value == $scope.item.country) {
            prefixCountry = v.display + ' - ';
            return;
          }
        });
        $scope.affiliates.forEach(function(v) {
          if(v.id == $scope.item.AffiliateNetworkId) {
            prefixAffiliate = v.name + ' - ';
            return;
          }
        });
        $scope.oldName = $scope.item.name;
        prefix = prefixAffiliate + prefixCountry;
      }

      $scope.$watch('affiliateId', function (newValue, oldValue) {
        if (newValue == "0") {
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

    $scope.nameChanged = function(name) {
      if(name == undefined || name.length < prefix.length) {
        $scope.item.name = prefix;
      } else if(name.indexOf(prefix) != 0) {
        var sub = name.substr(0, prefix.length);
        var arr1 = prefix.split('');
        var arr2 = sub.split('');
        var inputText = '';
        for(var i = 0, l = prefix.length; i < l; i++) {
          if(arr1[i] !== arr2[i]) {
            inputText = arr2[i];
            break;
          }
        }
        if(name.length < $scope.oldName.length) {
          $scope.item.name = $scope.oldName.substr(0, $scope.oldName.length - 1);
        } else {
          $scope.item.name = $scope.oldName + inputText;
        }
      }
      $scope.oldName = $scope.item.name;
    };

    $scope.countryChanged = function(country) {
      $scope.countries.forEach(function(v) {
        if(v.value == country) {
          prefixCountry = v.display + ' - ';
          return;
        }
      });
      var preStr = prefixAffiliate + prefixCountry;
      $scope.item.name = preStr + $scope.item.name.substr(prefix.length);
      $scope.oldName = preStr + $scope.oldName.substr(prefix.length);
      prefix = preStr;
    }

    $scope.affiliateChanged = function(id) {
      $scope.affiliates.forEach(function(v) {
        if(v.id == id) {
          prefixAffiliate = v.name + ' - ';
          return;
        }
      });
      var preStr = prefixAffiliate + prefixCountry;
      $scope.item.name = preStr + $scope.item.name.substr(prefix.length);
      $scope.oldName = preStr + $scope.oldName.substr(prefix.length);
      prefix = preStr;
    };

    $q.all(initPromises).then(initSuccess);

    this.titleType = angular.copy(this.perfType);

    this.cancel = $mdDialog.cancel;

    $scope.validateUrl = function () {
      var isValid = true;
      if (!$scope.item.url) {
        return;
      }
      if ($scope.item.url.indexOf('http://') == -1) {
        $scope.item.url = "http://" + $scope.item.url;
      }
      var strRegex = '^(http://)(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*([a-zA-Z0-9\&%_\./-~-]*)?$';
      var re=new RegExp(strRegex);
      if (!re.test($scope.item.url)) {
        isValid = false;
      }
      $scope.editForm.url.$setValidity('urlformat', isValid);
    };

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
      $rootScope.$broadcast('add', url, "url");
    };

    $scope.addAffiliateNetwork = function() {
      $mdDialog.cancel();
      $scope.$parent.$state.go('app.report.affiliate', {'affiliate': {'isShowAdd': true}});
    }
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
            {Parameter: '', Placeholder: '', Name: '', Track: 0},
            {Parameter: '', Placeholder: '', Name: '', Track: 0},
            {Parameter: '', Placeholder: '', Name: '', Track: 0},
            {Parameter: '', Placeholder: '', Name: '', Track: 0},
            {Parameter: '', Placeholder: '', Name: '', Track: 0},
            {Parameter: '', Placeholder: '', Name: '', Track: 0},
            {Parameter: '', Placeholder: '', Name: '', Track: 0},
            {Parameter: '', Placeholder: '', Name: '', Track: 0},
            {Parameter: '', Placeholder: '', Name: '', Track: 0},
            {Parameter: '', Placeholder: '', Name: '', Track: 0}
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
      $scope.externalId = {};
      $scope.cost = {};
      $scope.params = [
        {Parameter: '', Placeholder: '', Name: '', Track: 0},
        {Parameter: '', Placeholder: '', Name: '', Track: 0},
        {Parameter: '', Placeholder: '', Name: '', Track: 0},
        {Parameter: '', Placeholder: '', Name: '', Track: 0},
        {Parameter: '', Placeholder: '', Name: '', Track: 0},
        {Parameter: '', Placeholder: '', Name: '', Track: 0},
        {Parameter: '', Placeholder: '', Name: '', Track: 0},
        {Parameter: '', Placeholder: '', Name: '', Track: 0},
        {Parameter: '', Placeholder: '', Name: '', Track: 0},
        {Parameter: '', Placeholder: '', Name: '', Track: 0}
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

    $scope.validateUrl = function () {
      var isValid = true;
      if (!$scope.item.postbackUrl) {
        return;
      }
      if ($scope.item.postbackUrl.indexOf('http://') == -1) {
        $scope.item.postbackUrl = "http://" + $scope.item.postbackUrl;
      }
      var strRegex = '^(http://)(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*([a-zA-Z0-9\&%_\./-~-]*)?$';
      var re=new RegExp(strRegex);
      if (!re.test($scope.item.postbackUrl)) {
        isValid = false;
      }
      $scope.editForm.postbackUrl.$setValidity('urlformat', isValid);
    };

    $scope.urlItem = urlParameter["traffic"];
    $scope.urlTokenClick = function(url){
      $rootScope.$broadcast('add', url, "postbackUrl");
    };

    $scope.visible = false;
    $scope.toggleShow = function(){
      $scope.isActive = !$scope.isActive;
      $scope.visible = !$scope.visible;
    };

    $scope.$watch('externalId.Parameter', function (newValue, oldValue) {
      if(!newValue) {
        if ($scope.externalId) {
          delete $scope.externalId.Placeholder;
        }
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
        if ($scope.externalId) {
          delete $scope.externalId.Placeholder;
        }
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

    $scope.selectTrafficSourceTemplate = function (ev) {
      $mdDialog.show({
        multiple: true,
        skipHide: true,
        clickOutsideToClose: false,
        controller: ['$scope', '$mdDialog', 'TrafficTemplate', trafficSourceTemplateCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {},
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
    };

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
    } else if (type == 'traffic') {
      resourceName = 'TrafficSource';
    } else {
      resourceName = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }

    function deleteItem(item) {
      return $injector.get(resourceName).remove({id: item[type+"Id"], hash: item[type+"Hash"], name: item[type+"Name"]}).$promise;
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

  function initTags($scope, Tag) {
    $scope.tags = [];
    $scope.tagsFilter = {
        config: {
            plugins: ['remove_button'],
            create: true,
            valueField: 'name',
            labelField: 'name',
            searchField: ['name']
        },
        options: []
    };
    Tag.get(null, function(oData) {
      $scope.tagsFilter.options = oData.data.tags;
    });
  }

  function closeConfirmDialog($mdDialog) {
    $mdDialog.show({
      multiple: true,
      skipHide: true,
      clickOutsideToClose: false,
      controller: ['$scope', '$mdDialog', closeConfirmCtrl],
      controllerAs: 'ctrl',
      focusOnOpen: false,
      bindToController: true,
      templateUrl: 'tpl/close-confirm-dialog.html',
    }).then(function(){
      $mdDialog.cancel();
    });
    function closeConfirmCtrl($scope, $mdDialog) {
      this.title = "warnCloseTitle";
      this.content = 'warnClose';
      
      this.ok = function() {
        $mdDialog.hide();
      };

      this.cancel = function() {
        $mdDialog.cancel();
      };
    }
  }

})();
