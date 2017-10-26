(function () {

  angular.module('app')
    .controller('ReportCtrl', [
      '$scope', '$mdDialog', '$timeout', 'reportCache', 'columnDefinition', 'groupByOptions', 'Report', 'Preference', 'Profile', 'DateRangeUtil', 'LocalStorageUtil', 'TrafficSource', 'FileDownload', 'Domains', 'toastr', '$document', '$mdPanel', 'Tag', 'ConditionsFilter',
      ReportCtrl
    ])
    .controller('editLanderCtrl', [
      '$scope', '$rootScope', '$mdDialog', 'Lander', 'urlParameter', 'Tag', 'AppConstant', 'Setup', '$timeout', 'UrlValidate',
      editLanderCtrl
    ])
    .controller('editOfferCtrl', [
      '$scope', '$mdDialog', '$rootScope', '$q', '$timeout', 'Offer', 'AffiliateNetwork', 'urlParameter', 'DefaultPostBackUrl', 'Tag', 'AppConstant', 'reportCache', 'UrlValidate',
      editOfferCtrl
    ])
    .directive('resize',['$timeout','$q',function($timeout,$q){
      return function(scope, element) {
        function getElementTop(element){
          var actualTop = element.offsetTop;
          var current = element.offsetParent;
          while (current !== null){
            actualTop += current.offsetTop;
            current = current.offsetParent;
          }
          return actualTop;
        }
        var w_h = angular.element(window);
        function getHeight() {
          var deferred = $q.defer();
          $timeout(function() {
            deferred.resolve({
              'w_h': w_h.height(),
              'page_h': angular.element(element).closest('.table-box').next('md-table-pagination').outerHeight(true)
            });
          });
          return deferred.promise;
        }
        function heightResize() {
          getHeight().then(function(newVal) {
            var windowHeight = newVal.w_h;
            var pageHeight = newVal.page_h;
            var elementTop = getElementTop(element[0]);
            angular.element(element).css({
              'height': (windowHeight - elementTop - pageHeight - 30) + 'px'
            });
          });
        }
        w_h.bind('resize', function() {
          heightResize();
        });
        heightResize();
      }
    }]);

  function ReportCtrl($scope, $mdDialog, $timeout, reportCache, columnDefinition, groupByOptions, Report, Preference, Profile, DateRangeUtil, LocalStorageUtil, TrafficSource, FileDownload, Domains, toastr, $document, $mdPanel, Tag, ConditionsFilter) {
    var perfType = $scope.perfType = $scope.$state.current.name.split('.').pop();
    var fromCampaign = $scope.$stateParams.frcpn == '1';
    // 获取URL的参数
    var ftsParams = $scope.$stateParams.fts ? decodeURIComponent($scope.$stateParams.fts) : '';
    var filterItems = (function() {
      var temp = [];
      if(ftsParams) {
        ftsParams.split('|').forEach(function(ftsParam) {
          var t = ftsParam.split('$');
          temp.push({
            key: t[0],
            val: t[1],
            name: t[2]
          })
        });
      } else {
        temp = [];
      }
      return temp;
    })();
    $scope.filters = filterItems;

    // edit
    $scope.reportSelectedIds = [];
    $scope.reportSelectedIdsChanged = function(type, val) {
      if(type == 'push') {
        $scope.reportSelectedIds.push(val);
      } else if (type == 'eq') {
        $scope.reportSelectedIds = val;
      } else {
        $scope.reportSelectedIds.splice($scope.reportSelectedIds.indexOf(val), 1);
      }
      $scope.$apply(function() {
        $scope.reportSelectedIds = $scope.reportSelectedIds;
      });
    };
    $scope.closeEditToolbelt = function() {
      $scope.reportSelectedIds = [];
      angular.element('.check-all, .check-item').prop('checked', false);
    };

    function initDatePicker() {
      var reportDate = LocalStorageUtil.getValue(), startDate, endDate;
      if(!reportDate) {
        startDate = moment();
        endDate = moment();
      } else {
        switch (reportDate.dateType) {
          case '1':
            startDate = moment(); endDate = moment();
            break;
          case '2':
            startDate = moment().subtract(1, 'days'); endDate = moment().subtract(1, 'days');
            break;
          case '3':
            startDate = moment().subtract(6, 'days'); endDate = moment();
            break;
          case '4':
            startDate = moment().subtract(13, 'days'); endDate = moment();
            break;
          case '5':
            startDate = moment().startOf('week'); endDate = moment().endOf('week');
            break;
          case '6':
            startDate = moment().startOf('month'); endDate = moment().endOf('month');
            break;
          case '7':
            startDate = moment().subtract(1, 'month').startOf('month'); endDate = moment().subtract(1, 'month').endOf('month');
            break;
          default:
            startDate = moment(reportDate.fromDate); endDate = moment(reportDate.toDate);
        }
      }
      return {startDate: startDate, endDate: endDate};
    }

    function storageDatePicker(date) {
      var startDate = moment(date.startDate).format('YYYY-MM-DD'),
          endDate = moment(date.endDate).format('YYYY-MM-DD'),
          value = '1';
      if(moment().format('YYYY-MM-DD') == startDate && moment().format('YYYY-MM-DD') == endDate) { // Today
        value = '1';
      } else if (moment().subtract(1, 'days').format('YYYY-MM-DD') == startDate && moment().subtract(1, 'days').format('YYYY-MM-DD') == endDate) { // Yesterday
        value = '2';
      } else if (moment().subtract(6, 'days').format('YYYY-MM-DD') == startDate && moment().format('YYYY-MM-DD') == endDate) { // Last 7 Days
        value = '3';
      } else if (moment().subtract(13, 'days').format('YYYY-MM-DD') == startDate && moment().format('YYYY-MM-DD') == endDate) { // Last 14 Days
        value = '4';
      } else if (moment().startOf('week').format('YYYY-MM-DD') == startDate && moment().endOf('week').format('YYYY-MM-DD') == endDate) { // This week
        value = '5';
      } else if (moment().startOf('month').format('YYYY-MM-DD') == startDate && moment().endOf('month').format('YYYY-MM-DD') == endDate) { // This Months
        value = '6';
      } else if (moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD') == startDate && moment().subtract(1, 'month').endOf('month') == endDate) { // Last Month
        value = '7';
      } else { // custom
        value = '0';
      }
      LocalStorageUtil.setValue(value, startDate, '00:00', endDate, '00:00');
    }

    // datePicker
    $scope.datePicker = {date: initDatePicker()};
    $scope.options = {
      ranges: {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 14 Days': [moment().subtract(13, 'days'), moment()],
        'This week': [moment().startOf('week'), moment().endOf('week')],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      },
      eventHandlers: {
        'apply.daterangepicker': function(ev) {
          storageDatePicker(ev.model);
          $scope.applySearch();
        }
      }
    }

    // more
    var morePanel;
    $scope.showMorePanel = function() {
      var position = $mdPanel.newPanelPosition()
          .relativeTo('.more-vert-icon')
          .addPanelPosition($mdPanel.xPosition.ALIGN_START, $mdPanel.yPosition.BELOW);
      var config = {
        attachTo: angular.element(document.body),
        controller: ['mdPanelRef', '$scope', morePanelCtrl],
        controllerAs: 'ctrl',
        template: '<div class="material-list">' +
                    '<div class="group">' +
                      '<div class="material-select-item" ng-click="showChart($event)">' +
                        '<span class="text-line"><i class="material-icons">pie_chart</i>Show Chart</span>' +
                      '</div>' +
                      '<div class="material-select-item" ng-click="downLoad($event)">' +
                        '<span class="text-line"><i class="material-icons">file_download</i>Export CSV</span>' +
                      '</div>' +
                    '</div>' +
                   '</div>',
        panelClass: 'edit-selected-items-button-menu-box',
        position: position,
        clickOutsideToClose: true,
        locals: {
          'downLoad': $scope.downLoad
        },
        escapeToClose: true,
        focusOnOpen: false,
        zIndex: 2,
        onDomRemoved: function(result) {}
      };
      $mdPanel.open(config).then(function(result) {
        morePanel = result;
      });

      function morePanelCtrl(mdPanelRef, $scope) {
        var self = this;
        $scope.downLoad = function($event) {
          morePanel.close().then(function() {
            self.downLoad($event);
          });
        };
        $scope.showChart = function($event) {
          morePanel.close().then(function() {
            // TODO
          });
        };
      }
    };

    // edit item
    var selectedItemsPanel;
    $scope.showSelectedItemsPanel = function() {
      var position = $mdPanel.newPanelPosition()
          .relativeTo('.edit-selected-items-button')
          .addPanelPosition($mdPanel.xPosition.ALIGN_START, $mdPanel.yPosition.BELOW);
      var config = {
        attachTo: angular.element(document.body),
        controller: ['mdPanelRef', '$scope', selectedItemsPanelCtrl],
        controllerAs: 'ctrl',
        template: '<div class="material-list">' +
                    '<div class="group">' +
                      '<div class="material-select-item" ng-click="editItem(0)">' +
                        '<span class="text-line"><i class="material-icons enable">lens</i>Enable</span>' +
                      '</div>' +
                      '<div class="material-select-item hidden" ng-click="editItem(1)">' +
                        '<span class="text-line"><i class="material-icons pause">pause_circle_filled</i>Pause</span>' +
                      '</div>' +
                      '<div class="material-select-item" ng-click="editItem(2)">' +
                        '<span class="text-line"><i class="material-icons remove">remove_circle</i>Remove</span>' +
                      '</div>' +
                    '</div>' +
                   '</div>',
        panelClass: 'edit-selected-items-button-menu-box',
        position: position,
        clickOutsideToClose: true,
        locals: {
          'selectedItems': [],
          batchSelectedIdsEnable: $scope.batchSelectedIdsEnable,
          batchSelectedIdsRemove: $scope.batchSelectedIdsRemove
        },
        escapeToClose: true,
        focusOnOpen: false,
        zIndex: 2,
        onDomRemoved: function(result) {}
      };
      $mdPanel.open(config).then(function(result) {
        selectedItemsPanel = result;
      });

      function selectedItemsPanelCtrl(mdPanelRef, $scope) {
        var self = this;
        $scope.editItem = function(type) {
          if(type == 0) { // enable
            mdPanelRef.close().then(function() {
              self.batchSelectedIdsEnable();
            });
          } else if (type == 1) { // pause

          } else { // remove
            mdPanelRef.close().then(function() {
              self.batchSelectedIdsRemove();
            });
          }
        }
      }
    };
    $scope.batchSelectedIdsEnable = function() {
      var ids = $scope.reportSelectedIds;
      var items = $scope.report.rows.filter(function(d) {
        return ids.indexOf(d.data.id + '') > -1 && d.data.deleted == 1;
      });
      if(items.length > 0) {
        $scope.restoreItem(null, items);
      }
    };
    $scope.batchSelectedIdsRemove = function() {
      var ids = $scope.reportSelectedIds;
      var items = $scope.report.rows.filter(function(d) {
        return ids.indexOf(d.data.id + '') > -1 && d.data.deleted == 0;
      });
      if(items.length > 0) {
        $scope.deleteItem(null, items);
      }
    };
    // keyword
    var filterKeywordPanel;
    $scope.filterKeywordChanged = function(keyword) {
      if(!keyword) {
        filterKeywordPanel && filterKeywordPanel.close();
      } else {
        if(!filterKeywordPanel) {
          showKeywordPanel(keyword);
        } else {
          filterKeywordPanel.close().then(showKeywordPanel(keyword));
        }
      }
    };
    $scope.filterKeywordSearched = function(oData, key) {
      angular.element(window).resize();
      $scope.openFilterUI = true;
      $scope.searchFilter = '';
      $scope.addFilter(oData, key);
    };
    function showKeywordPanel(keyword) {
      var position = $mdPanel.newPanelPosition()
          .relativeTo('.filter-keyword')
          .addPanelPosition($mdPanel.xPosition.ALIGN_START, $mdPanel.yPosition.BELOW);
      var config = {
        attachTo: angular.element(document.body),
        controller: ['mdPanelRef', function(mdPanelRef) {
          var self = this;
          this.open = function() {
            filterKeywordPanel.close().then(self.filterKeywordSearched({name: 'Campaign name', value: keyword, key: 'filter'}, 'keyword'));
          }
        }],
        controllerAs: 'ctrl',
        template: '<div class="material-list" ng-click="ctrl.open()">' +
                    '<div class="group">' +
                      '<div class="material-select-item">' +
                        '<span class="text-line name">Filter campaigns by ' + keyword + '</span>' +
                      '</div>' +
                    '</div>' +
                   '</div>',
        panelClass: 'add-filter-menu-box',
        position: position,
        clickOutsideToClose: true,
        locals: {
          'filterKeywordSearched': $scope.filterKeywordSearched
        },
        escapeToClose: true,
        focusOnOpen: false,
        zIndex: 2,
        onDomRemoved: function(result) {}
      };
      $mdPanel.open(config).then(function(result) {
        filterKeywordPanel = result;
      });
    }

    // group segment
    var segmentPanel;
    $scope.showSegmentPanel = function() {
      var position = $mdPanel.newPanelPosition()
          .relativeTo('.data-usage-groups')
          .addPanelPosition($mdPanel.xPosition.ALIGN_START, $mdPanel.yPosition.BELOW);
      var config = {
        attachTo: angular.element(document.body),
        controller: ['mdPanelRef', '$scope', segmentPanelCtrl],
        controllerAs: 'ctrl',
        template: '<div class="material-list">' +
                    '<div class="group">' +
                      '<div class="material-select-item" ng-repeat="gb in groupByOptions">' +
                        '<span class="text-line">{{gb.display}}<em ng-if="groupbyParamValue(gb)">: {{gb.paramValue}}</em></span>' +
                      '</div>' +
                    '</div>' +
                   '</div>',
        panelClass: 'data-usage-groups-menu-box',
        position: position,
        clickOutsideToClose: true,
        locals: {
          groupByOptions: $scope.groupByOptions,
          groupbyParamValue: $scope.groupbyParamValue
        },
        escapeToClose: true,
        focusOnOpen: false,
        zIndex: 2,
        onDomRemoved: function(result) {}
      };
      $mdPanel.open(config).then(function(result) {
        segmentPanel = result;
      });

      function segmentPanelCtrl(mdPanelRef, $scope) {
        var self = this;
        $scope.groupByOptions = this.groupByOptions;
        $scope.groupbyParamValue = this.groupbyParamValue;
      }
    };

    $scope.openSegmentUI = false;
    $scope.segmentExpressions = [];
    $scope.closeSegment = function() {
      angular.element(window).resize();
      $scope.openSegmentUI = false;
      if($scope.segmentExpressions.length > 0) {
        $scope.segmentExpressions = [];
        $scope.groupBy[1] = '';
        $scope.groupBy[2] = '';
        $scope.applySearch();
      }
    };
    $scope.openSegment = function() {
      if($scope.openSegmentUI) {
        if($scope.segmentExpressions.length > 0) {
          $scope.openSegmentUI = false;
          $scope.groupBy[1] = '';
          $scope.groupBy[2] = '';
          $scope.applySearch();
        }
      } else {
        $scope.openSegmentUI = true;
        $timeout(function() {
          angular.element('.menu-segment-open-button').focus().andSelf().trigger('click');
        });
      }
      angular.element(window).resize();
    };
    $scope.segmentExpressionRemove = function(segmentExpression) {
      $scope.segmentExpressions.splice($scope.segmentExpressions.indexOf(segmentExpression), 1);
      if($scope.segmentExpressions.length == 0) {
        $scope.groupBy[1] = '';
        $scope.groupBy[2] = '';
      } else if($scope.segmentExpressions.length == 1) {
        $scope.groupBy[1] = $scope.segmentExpressions[0].value;
        $scope.groupBy[2] = '';
      }
      $scope.applySearch();
    };
    $scope.addSegment = function(segment) {
      if(segment.value == perfType) {return;}
      if($scope.segmentExpressions.length == 2) {return;}
      if($scope.segmentExpressions.length == 1 && $scope.segmentExpressions[0].value == segment.value) {return;}
      $scope.segmentExpressions.push(segment);
      if($scope.segmentExpressions.length == 1) {
        $scope.groupBy[1] = segment.value;
        $scope.groupBy[2] = '';
      } else {
        $scope.groupBy[2] = segment.value;
      }
      $scope.applySearch();
    };
    $scope.showSegmentMenu = function($event) {
      var position = $mdPanel.newPanelPosition()
          .relativeTo('.menu-segment-open-button')
          .addPanelPosition($mdPanel.xPosition.ALIGN_START, $mdPanel.yPosition.BELOW);
      var config = {
        attachTo: angular.element(document.body),
        controller: ['mdPanelRef', '$timeout', '$scope', segmentPanelCtrl],
        controllerAs: 'ctrl',
        template: '<div class="material-list">' +
                    '<div class="group">' +
                      '<div class="material-select-item" ng-repeat="gb in groupByOptions" ng-click="addGroupBy(gb)">' +
                        '<span class="text-line">{{gb.display}}<em ng-if="groupbyParamValue(gb)">: {{gb.paramValue}}</em></span>' +
                      '</div>' +
                    '</div>' +
                   '</div>',
        panelClass: 'add-filter-menu-box',
        position: position,
        locals: {
          groupByOptions: $scope.groupByOptions,
          groupbyParamValue: $scope.groupbyParamValue,
          addSegment: $scope.addSegment
        },
        clickOutsideToClose: true,
        escapeToClose: true,
        focusOnOpen: false,
        zIndex: 2,
        onDomRemoved: function(result) {}
      };
      $mdPanel.open(config).then(function(result) {
        segmentPanel = result;
      });

      function segmentPanelCtrl(mdPanelRef, $timeout, $scope) {
        var self = this;
        this._mdPanelRef = mdPanelRef;
        $scope.groupByOptions = this.groupByOptions;
        $scope.groupbyParamValue = this.groupbyParamValue;
        $scope.addGroupBy = function(gb) {
          self._mdPanelRef && self._mdPanelRef.close().then(function() {
            self.addSegment(gb);
          });
        }
      }
    };
    $scope.segmentItemBlured = function() {
      $scope.segment = '';
    };
    $scope.segmentItem = function(item) {

    };

    // Filters
    var _result;
    var reportFilters = [{
      name: 'Default filters',
      key: 'default',
      items: [
        {name: 'All enabled campaigns', value: 'All enabled campaigns', _value: '1', key: 'status'},
        {name: 'All non-active campaigns', value: 'All non-active campaigns', _value: '0', key: 'status'},
        {name: 'All campaigns', value: 'All campaigns', _value: '2', key: 'status'}
      ]
    }, {
      name: 'Saved filters',
      key: 'saved',
      items: []
    }, {
      name: 'Tag filters',
      key: 'tag',
      items: []
    }, {
      name: 'Other filters',
      key: 'others',
      items: [
        {name: 'Impr.', key: 'impression'},
        {name: 'Visits', key: 'visits'},
        {name: 'Clicks', key: 'clicks'},
        {name: 'Conversions', key: 'conversions'},
        {name: 'Revenue', key: 'revenue'},
        {name: 'Cost', key: 'cost'},
        {name: 'Profit', key: 'profit'},
        {name: 'CPV', key: 'cpv'},
        {name: 'ICTR', key: 'ictr'},
        {name: 'CR', key: 'cr'},
        {name: 'CV', key: 'cv'},
        {name: 'ROI', key: 'roi'},
        {name: 'EPV', key: 'epv'},
        {name: 'EPC', key: 'epc'},
        {name: 'AP', key: 'ap'},
      ]
    }];
    $scope.reportFilters = angular.copy(reportFilters);
    // 获取 Tags
    var tagType = perfType == 'campaign' ? 1 : (perfType == 'lander' ? 2 : (perfType == 'offer' ? 3 : 0));
    if(tagType) {
      Tag.get({type: tagType}, function(oData) {
        if(oData.status) {
          var newData = {};
          oData.data.tags.forEach(function(t) {
            if(newData[t.name]) {
              newData[t.name].push(t.targetId);
            } else {
              newData[t.name] = [t.targetId];
            }
          });
          for(var key in newData) {
            reportFilters[2].items.push({name: key, value: key, _value: newData[key], key: 'tag'})
          }
          $scope.reportFilters = angular.copy(reportFilters);
        }
      });
    }

    // 获取保存的 filters
    var _filterArr = [];
    ConditionsFilter.get({}, function(oData) {
      if(oData.status) {
        _filterArr = reportFilters[1].items = oData.data.filters;
      }
      $scope.reportFilters = angular.copy(reportFilters);
    });

    var filterExpressions = $scope.filterExpressions = [];
    $scope.openFilterUI = false;
    $scope.filterSaveUI = false;
    $scope.closeFilter = function() {
      angular.element(window).resize();
      $scope.openFilterUI = false;
      if($scope.filterExpressions.length > 0) {
        $scope.filterExpressions = [];
        $scope.applySearch();
      }
    };
    $scope.openFilter = function() {
      angular.element(window).resize();
      if($scope.openFilterUI) {
        $scope.openFilterUI = false;
        if($scope.filterExpressions.length > 0) {
          $scope.filterExpressions = [];
          $scope.applySearch();
        }
      } else {
        $scope.openFilterUI = true;
        $timeout(function() {
          angular.element('.menu-open-button').focus().andSelf().trigger('click');
        });
      }
    };
    $scope.saveFilter = function() {
      $mdDialog.show({
        controller: ['$mdDialog', '$scope', 'ConditionsFilter', saveFilterCtrl],
        controllerAs: 'ctrl',
        locals: {filterExpressions: angular.copy($scope.filterExpressions), filterArr: angular.copy(_filterArr)},
        bindToController: true,
        clickOutsideToClose: false,
        escapeToClose: false,
        focusOnOpen: false,
        templateUrl: 'tpl/save-filter-dialog.html?' + +new Date()
      }).then(function(items) {
        _filterArr = reportFilters[1].items = items;
        $scope.reportFilters = angular.copy(reportFilters);
        $scope.applySearch();
      });
      function saveFilterCtrl($mdDialog, $scope, ConditionsFilter) {
        var self = this;
        this.title = 'New saved filter';
        this.cancel = $mdDialog.cancel;
        this.ok = function() {
          ConditionsFilter.save({items: JSON.stringify(this.filterExpressions), name: $scope.filterName}, function(oData) {
            if(oData.status) {
              $mdDialog.hide(oData.data.filters);
            }
          });
        };
        $scope.filterNameInput = function(v) {
          $scope.repetitionStatue = self.filterArr.some(function(f) {
            return f.name == v;
          });
        };
      }
    };
    $scope.filterExpressionRemove = function(filterExpression) {
      $scope.filterExpressions.splice($scope.filterExpressions.indexOf(filterExpression), 1);
      if($scope.filterExpressions.length == 0) {
        $scope.filterSaveUI = false;
      } else {
        $scope.filterSaveUI = true;
      }
      $scope.applySearch();
    };
    $scope.editFilterExpression = function(filterExpression) {
      if(['tag', '', 'saved', 'status'].indexOf(filterExpression.key) > -1) {return;}
      $mdDialog.show({
        controller: ['$mdDialog', '$scope', panelDialogCtrl],
        controllerAs: 'ctrl',
        locals: {oData: angular.copy(filterExpression), edit: true},
        bindToController: true,
        clickOutsideToClose: true,
        escapeToClose: true,
        focusOnOpen: false,
        templateUrl: 'tpl/add-filter-item.html?' + +new Date()
      }).then(function (oData) {
        filterExpression.value = oData.result.value;
        filterExpression.operator = oData.result.operator;
        $scope.filterSaveUI = true;
        $scope.applySearch();
      });
    };

    $scope.filterItemBlured = function() {
      $scope.filter = '';
      $scope.reportFilters = angular.copy(reportFilters);
    };
    $scope.filterItem = function(k) {
      var temp = angular.copy(reportFilters)
      temp.forEach(function(e) {
        e.items = e.items.filter(function(i) {
          return i.name.indexOf(k) > -1;
        });
      });
      $scope.reportFilters = temp.filter(function(e) {
        return e.items.length > 0
      });
      _result.close().then(function() {
        $scope.showMenu();
      });
    };
    $scope.addFilter = function(oData, key) {
      if(key == 'default') {
        $scope.filterExpressions = [{name: 'Status', value: oData.value, _value: oData._value, key: oData.key, operator: '='}];
        $scope.filterSaveUI = false;
        $scope.applySearch();
      } else if(key == 'saved') {
        $scope.filterExpressions = oData.items;
        $scope.filterSaveUI = false;
        $scope.applySearch();
      } else if(key == 'tag') {
        $scope.filterExpressions = [{name: 'Tag', value: oData.value, _value: oData._value, key: oData.key, operator: '='}];
        $scope.filterSaveUI = false;
        $scope.applySearch();
      } else if(key == 'keyword') {
        $scope.filterExpressions = [{name: oData.name, value: oData.value, _value: oData.value, key: oData.key, operator: 'contains'}];
        $scope.filterSaveUI = false;
        $scope.applySearch();
      } else {
        $mdDialog.show({
          controller: ['$mdDialog', '$scope', panelDialogCtrl],
          controllerAs: 'ctrl',
          locals: {oData: oData},
          bindToController: true,
          clickOutsideToClose: true,
          escapeToClose: true,
          focusOnOpen: false,
          templateUrl: 'tpl/add-filter-item.html?' + +new Date()
        }).then(function (oData) {
          $scope.filterExpressions.push({name: oData.message.name, value: oData.result.value, _value: oData.result.value, key: oData.message.key, operator: oData.result.operator});
          $scope.filterSaveUI = true;
          $scope.applySearch();
        });
      }
    };
    function panelDialogCtrl($mdDialog, $scope) {
      var self = this;
      this.title = this.oData.name;
      this.cancel = $mdDialog.cancel;
      this.apply = function() {
        $mdDialog.hide({message: self.oData, result: $scope.oData});
      };
      if('filter' == this.oData.key) {
        $scope.operators = [
          {value: 'contains', display: 'contains'},
        ];
      } else {
        $scope.operators = [
          {value: '>', display: '>'},
          {value: '>=', display: '>='},
          {value: '=', display: '='},
          {value: '!=', display: '!='},
          {value: '<', display: '<'},
          {value: '<=', display: '<='}
        ];
      }
      if(this.edit) {
        $scope.oData = this.oData;
      } else {
        $scope.oData = {operator: '>', value: ''};
      }
    }
    $scope.resetFilter = function(items) {
      _filterArr = reportFilters[1].items = items;
      $scope.reportFilters = angular.copy(reportFilters);
      _result.close().then(function() {
        $scope.showMenu();
      });
    };
    $scope.showMenu = function() {
      var position = $mdPanel.newPanelPosition()
          .relativeTo('.menu-open-button')
          .addPanelPosition($mdPanel.xPosition.ALIGN_START, $mdPanel.yPosition.BELOW);
      var config = {
        attachTo: angular.element(document.body),
        controller: ['mdPanelRef', '$timeout', 'ConditionsFilter', panelMenuCtrl],
        controllerAs: 'ctrl',
        templateUrl: 'tpl/add-filter-menu.html?' + +new Date(),
        panelClass: 'add-filter-menu-box',
        position: position,
        locals: {
          'reportFilters': this.reportFilters,
          'addFilter': this.addFilter,
          'resetFilter': this.resetFilter
        },
        clickOutsideToClose: true,
        escapeToClose: true,
        focusOnOpen: false,
        zIndex: 2,
        onDomRemoved: function(result) {}
      };
      $mdPanel.open(config).then(function(result) {
        _result = result;
      });
    };
    function panelMenuCtrl(mdPanelRef, $timeout, ConditionsFilter) {
      var self = this;
      this._mdPanelRef = mdPanelRef;
      this.selectDessert = function(item, key) {
        self._mdPanelRef && self._mdPanelRef.close().then(function() {
          self.addFilter(item, key);
        });
      };
      this.removeSavedFilter = function($event, item) {
        $event.stopPropagation();
        var self = this;
        $mdDialog.show({
          clickOutsideToClose: false,
          escapeToClose: false,
          controller: ['$mdDialog', '$injector', 'toastr', 'ConditionsFilter', deleteFilterCtrl],
          controllerAs: 'ctrl',
          focusOnOpen: false,
          locals: {item: item},
          bindToController: true,
          targetEvent: $event,
          templateUrl: 'tpl/delete-filter-dialog.html?' + +new Date()
        }).then(function(items) {
          self.resetFilter(items);
        });
      };

      function deleteFilterCtrl($mdDialog, $injector, toastr, ConditionsFilter) {
        var self = this;
        this.title = 'Delete filter set';
        this.content = 'Delete saved filter "' + this.item.name + '"?';
        this.cancel = $mdDialog.cancel;
        this.ok = function () {
          deleteItem(self.item).then(success, error);
        };

        function deleteItem(item) {
          return ConditionsFilter.remove({id: item.id, errorFn: true}).$promise;
        }

        this.onprocess = false;
        function success(oData) {
          this.onprocess = true;
          if(oData.status == 0) {
            toastr.success(oData.message || 'Error occured when delete.');
          } else {
            $mdDialog.hide(oData.data.filters);
          }
        }
        function error() {
          this.onprocess = true;
          toastr.clear();
          toastr.success('Error occurred when delete.');
        }
      }
    }

    $scope.addFab = {isOpen: false, direction: 'right'}

    $scope.app.subtitle = perfType;
    $scope.groupByOptions = angular.copy(groupByOptions);
    // delete later
    $scope.loading = true;
    $scope.datatypes = [
      {value: "1", display: "Today"},
      {value: "2", display: "Yesterday"},
      {value: "3", display: "Last 7 days"},
      {value: "4", display: "Last 14 days"},
      {value: "5", display: "This Week"},
      {value: "6", display: "Last Week"},
      {value: "7", display: "This Month"},
      {value: "8", display: "Last Month"},
      {value: "9", display: "This Year"},
      {value: "10", display: "Last Year"},
      {value: "0", display: "Custom"},
    ];
    var retentionLimit = $scope.permissions.report.retentionLimit;
    // 根据权限做时间限制 delete later
    function filterDateType() {
      return function(datetype) {
        if (datetype.value == "0") {
          return true;
        }
        var fromDate = DateRangeUtil.fromDate(datetype.value, $scope.query.tz);
        var toDate = DateRangeUtil.toDate(datetype.value, $scope.query.tz);
        var diff = DateRangeUtil.diffMonths(fromDate, toDate);
        return diff < retentionLimit;
      }
    };

    // status, from, to, datetype, groupBy
    var pageStatus = {};

    // TODO
    var stateParams = $scope.$stateParams;
    if (stateParams.extgrpby) {
      var egb = (stateParams.extgrpby + ',').split(',');
      $scope.groupBy = [perfType, egb[0], egb[1]];
      if(egb[0] || egb[1]) {
        $scope.openSegmentUI = true;
        $scope.segmentExpressions = $scope.groupByOptions.filter(function(op) {
          return op.value == egb[0] || op.value == egb[1];
        });
      }
      $scope.treeLevel = $scope.groupBy.filter(notEmpty).length;
    } else {
      $scope.groupBy = [perfType, '', ''];
      $scope.treeLevel = 1;
    }
    pageStatus.groupBy = angular.copy($scope.groupBy);

    // 初始化dateType delete later
    /**
    if (stateParams.datetype) {
      $scope.datetype = stateParams.datetype;
      if ($scope.datetype == '0') {
        var fromDate = (stateParams.from || '').split('T');
        var toDate = (stateParams.to || '').split('T');
        $scope.fromDate = fromDate[0];
        $scope.fromTime = fromDate[1];
        $scope.toDate = toDate[0];
        $scope.toTime = toDate[1];
      }
    } else {
      $scope.datetype = LocalStorageUtil.getValue().datetype;
    }
    */

    // init status
    /**
    if (stateParams.status) {
      $scope.activeStatus = pageStatus.status = stateParams.status;
    } else {
      $scope.activeStatus = pageStatus.status = 1;
    }
    */

    // fill group by and drilldown v1-v10 paramsName
    $scope.drilldownTrafficId = null;
    if (perfType == 'campaign' || perfType == 'traffic') {
      $scope.drilldownTrafficId = 0;
    } else if (stateParams.drilldownTrafficId) {
      $scope.drilldownTrafficId = stateParams.drilldownTrafficId;
      TrafficSource.get({id: $scope.drilldownTrafficId}, function (traffic) {
        if (traffic.status) {
          // drilldown v1-v10的名字
          var params = JSON.parse(traffic.data.params);
          $scope.groupByOptions.forEach(function(option, index) {
            if (option.role == 'campaign') {
              var idx = option.value.substring(1);
              var parameter = params[idx-1].Name;
              if (parameter) {
                $scope.groupByOptions[index].paramValue = parameter;
              } else {
                $scope.groupByOptions[index].paramValue = 'N/A';
              }
            }
          });
        }
      });
    }

    $scope.query = {
      page: 1,
      __tk: 0
    };
    // delete later
    /**
    $scope.fromDate = $scope.fromDate || LocalStorageUtil.getValue().fromDate;
    $scope.fromTime = $scope.fromTime || LocalStorageUtil.getValue().fromTime;
    $scope.toDate = $scope.toDate || LocalStorageUtil.getValue().toDate;
    $scope.toTime = $scope.toTime || LocalStorageUtil.getValue().toTime;
    pageStatus.datetype = $scope.datetype;

    var minFromDate = DateRangeUtil.minFromDate($scope.toDate, retentionLimit);

    $scope.fromDateOptions = {
      minDate: minFromDate,
      maxDate: $scope.toDate
    }
    $scope.toDateOptions = {
      minDate: minFromDate,
      maxDate: $scope.toDate
    }
    */

    // groupByOptions.forEach(function(gb) {
    //   var val = stateParams.filters[gb.value];
    //   if (val) {
    //     var cacheKey = gb.value + ':' + val;
    //     // todo: get name from server if not in cache
    //     var cache = reportCache.get(cacheKey);
    //     var cacheName = val;
    //     // filter顺序
    //     var level = 0;
    //     if (cache) {
    //       cacheName = cache.name;
    //       level = cache.level;
    //     }
    //     $scope.filters.splice(level-1, 0, { key: gb.value, val: val, name: cacheName });
    //   }
    // });

    // $scope.filters = [];
    // $scope.filters = filterItems;

    var groupMap = {};
    groupByOptions.forEach(function(group) {
      groupMap[group.value] = group;
    });

    // columns
    var cols = angular.copy(columnDefinition[perfType].concat(columnDefinition['common']));
    // 导出报表列
    $scope.downloadColumns = angular.copy(cols);
    // dirty fix tree view name column
    cols[0].role = 'name';
    cols[0].origKey = cols[0].key;
    cols[0].origName = cols[0].name;
    if ($scope.treeLevel > 1) {
      cols[0].key = 'name';
      cols[0].name = 'Name';
    }
    $scope.columns = cols;

    $scope.filterColumns = function(item) {
      return item.role != 'name';
    };

    // $scope.btnName = 'Refresh';
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
            var nextIdx;
            if ((idx + 1) < $scope.report.rows.length) {
              nextIdx = idx + 1;
            } else {
              nextIdx = idx;
            }
            if ($scope.report.rows[nextIdx].parentRow != parentRow) {
              Array.prototype.splice.apply($scope.report.rows, [idx+1, 0].concat(rows));
              parentRow.childrenLoaded = true;
              parentRow.expanded = true;
            }
          } else {
            $scope.report = result.data;
            $scope.report.rows = rows;
          }
          // $scope.loading = false;
        }

        // if($scope.resetSearchParamsClicked) {
        //   $scope.resetBtn = false;
        //   $scope.applyBtn = false;
        //   $scope.btnName = 'refresh';
        //   $scope.resetSearchParamsClicked = false;
        // }
        // $scope.disabled = false;
        rerenderReportTable();
        //$scope.btnName = 'Refresh';
        //$scope.applyBtn = false;

      };
    }
    // TODO
    // $scope.$watch('groupBy + datetype + fromDate + fromTime + toDate + toTime + activeStatus + searchFilter ', function(newVal, oldVal) {
    //   if (newVal != oldVal) {
    //     $scope.applyBtn = true;
    //     $scope.btnName = 'apply';
    //     $scope.resetBtn = true;
    //   }
    // }, true);

    function notEmpty(val) {
      return !!val;
    }

    /**
     * @parames dataType {string}
     */
    function getList(parentRow, dataType) {
      var params = {};
      $scope.filters.forEach(function(f) { params[f.key] = f.val });
      $scope.reportSelectedIds = [];
      console.log('params', params);
      console.log('$scope.query', $scope.query);
      console.log('pageStatus', pageStatus);
      // filter
      console.log('$scope.filterExpressions', $scope.filterExpressions);
      var expressions = $scope.filterExpressions, conditions = [];
      pageStatus.status = 1;
      pageStatus.filter = '';
      pageStatus.tag = '';
      if(expressions.length > 0) {
        expressions.forEach(function(e) {
          switch (e.key) {
            case 'tag':
              pageStatus.tag = 'ids=' + e._value.join(',');
              break;
            case 'filter':
              pageStatus.filter = e._value;
              break;
            case 'status':
              pageStatus.status = e._value;
              break;
            default:
              conditions.push(e.key + e.operator + e._value);
              break;
          }
        });
      }

      angular.extend(params, $scope.query, pageStatus);
      if(conditions.length > 0) {
        params.conditions = conditions.join('&');
      }
      delete params.__tk;
      delete params.datetype;
      delete params.groupBy;

      if (parentRow) {
        params.groupBy = pageStatus.groupBy[parentRow.treeLevel];
        params.page = 1;
        //params.limit = -1;
        // 多级group by不支持状态和搜索框搜索
        delete params.filter;
        delete params.status;
        delete params.tag;

        var pgrp = pageStatus.groupBy[parentRow.treeLevel - 1];
        params[pgrp] = parentRow.id;

        if (parentRow.treeLevel == 2) {
          var ppRow = parentRow.parentRow;
          var ppgrp = pageStatus.groupBy[0];
          params[ppgrp] = ppRow.id;
        }
        angular.extend(params, {order: '-visits'});
      } else {
        params.groupBy = pageStatus.groupBy[0];
      }

      if (dataType) {
        var groupBy = "";
        $scope.groupBy.forEach(function(group) {
          if (group) {
            groupBy += group + ",";
          }
        });
        params.groupBy = groupBy.substring(0, groupBy.length-1);
        params.dataType = dataType;
        params.columns = $scope.downloadReportCols;
        FileDownload.download(params);
      } else {
        $scope.promise = Report.get(params, buildSuccess(parentRow)).$promise;
      }
    };

    function watchFilter() {
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
        if (!newVal) return;

        $scope.reportViewColumns = angular.copy(newVal.reportViewColumns);
        angular.extend($scope.query, {
          limit: newVal.reportViewLimit,
          order: newVal.reportViewOrder,
        });
        /*if (!pageStatus.status) {
          $scope.activeStatus = newVal.entityType;
          pageStatus.status = newVal.entityType;
        }*/

        // 处理下载报表的列
        var downloadCols = '';
        $scope.downloadColumns.forEach(function (col) {
          if ($scope.reportViewColumns[col.key] && $scope.reportViewColumns[col.key].visible) {
            downloadCols += col.key + ',';
          }
        });
        $scope.downloadReportCols = downloadCols;

        unwatch();
        unwatch = null;
      }, true);
    }

    Profile.get(null, function (profile) {
      if (!profile.status) {
        return;
      }
      $scope.profile = profile.data;
      watchFilter();
      $scope.query.tz = $scope.profile.timezone;
      getDateRange($scope.query.tz);
      // $scope.datetypeFilter = filterDateType();
    });

    $scope.deleteFilter = function(filter) {
      var idx = $scope.filters.indexOf(filter);
      $scope.filters.splice(idx, 1);
      $scope.query.page = 1;
      $scope.query.__tk += 1;
    };

    // delete later
    $scope.changeGroupby = function(idx) {
      if (idx == 0) {
        $scope.groupBy[1] = "";
      }
      $scope.groupBy[2] = "";
      if ($scope.groupBy[1] || $scope.activeStatusIsDisabled()) {
        $scope.activeStatus = 2;
      }
    };

    $scope.activeStatusIsDisabled = function() {
      return ['campaign', 'flow', 'lander', 'offer', 'traffic', 'affiliate'].indexOf($scope.groupBy[0]) < 0;
    }

    function filteGroupBy(level) {
      return function(item) {
        var exclude = [];
        $scope.filters.forEach(function(f) {
          exclude.push(f.key);
        });

        exclude.push('ip');
        exclude.push($scope.groupBy[0]);
        if (level == 2) {
          exclude.push($scope.groupBy[1]);
        }
        return exclude.indexOf(item.value) == -1;
      }
    }

    function filteFirstGroupBy() {
      return function(item) {
        var exclude = [];
        var isShowIp = false;
        $scope.filters.forEach(function(f) {
          if (f.key == 'campaign') {
            isShowIp = true;
          }
        });
        if (!isShowIp) {
          exclude.push('ip');
        }
        return exclude.indexOf(item.value) == -1;
      }
    }

    $scope.groupbyFilter = filteFirstGroupBy();
    $scope.groupbyFilter1 = filteGroupBy(1);
    $scope.groupbyFilter2 = filteGroupBy(2);

    $scope.groupbyParamValue = function filterGroupByParamValue(value) {
      return perfType != "campaign" && perfType != "traffic" && value.paramValue;
    }

    /*$scope.filterIsHow = function (item) {
      return item.level == 0;
    };*/

    $scope.hours = [];
    for (var i = 0; i < 24; ++i) {
      if (i < 10) {
        $scope.hours.push('0' + i + ':00');
      } else {
        $scope.hours.push('' + i + ':00');
      }
    }

    $scope.applySearch = function() {
      // $scope.loading = true;
      // $scope.btnName = 'Refresh';
      // $scope.applyBtn = false;
      $scope.treeLevel = $scope.groupBy.filter(notEmpty).length;
      // $scope.disabled = true;
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

      $scope.query.filter = $scope.searchFilter;
      getDateRange($scope.query.tz);
      // pageStatus.datetype = $scope.datetype;
      // pageStatus.status = $scope.activeStatus;

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

    // delete later
    $scope.resetSearchParams = function() {
      $scope.searchFilter = '';
      $scope.activeStatus = 2;
      $scope.treeLevel = 1;
      $scope.groupBy[0] = perfType;
      $scope.groupBy[1] = '';
      $scope.groupBy[2] = '';
      $scope.resetSearchParamsClicked = true;
      $scope.applySearch();
    };

    $scope.downLoad = function () {
      getList(null, 'csv');
    };

    $scope.toggleRow = function(row) {
      if (row.expanded) {
        row.expanded = false;
        var temp = [];
        $scope.report.rows.forEach(function(item) {
          if (item.parentRow != row) {
            // item.expanded = false;
            temp.push(item);
          }
        });
        $scope.report.rows = temp;
        rerenderReportTable();
        return;
      }
      // if (row.childrenLoaded) {
      //   row.expanded = true;
      //   return;
      // } else {
        $scope.loading = true;
        getList(row);
      // }
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
    // $scope.canEdit = ['campaign', 'flow', 'lander', 'offer', 'traffic', 'affiliate'].indexOf(perfType) >= 0;
    $scope.canEdit = function (row) {
      if(row) {
        return ['campaign', 'flow', 'lander', 'offer', 'traffic', 'affiliate'].indexOf(perfType) >= 0 && row.treeLevel == 1;
      } else {
        return ['campaign', 'flow', 'lander', 'offer', 'traffic', 'affiliate'].indexOf(perfType) >= 0;
      }
    };
    $scope.drilldownFilter = function(item) {
      var exclude = [];
      exclude.push(pageStatus.groupBy[0]);
      if (perfType != 'campaign' && perfType != 'traffic' && item.role == 'campaign' && !$scope.drilldownTrafficId) {
        exclude.push(item.value);
      }
      if (perfType != 'campaign' && item.role == 'ip') {
        exclude.push(item.value);
      }
      $scope.filters.forEach(function(f) {
        exclude.push(f.key);
      });
      return exclude.indexOf(item.value) == -1;
    };

    var mainDomain;
    // 获取 MainDomain
    Domains.get({}, function(result) {
      result.data.internal.forEach(function(internal) {
        if (internal.main) {
          mainDomain = {
            internal: true,
            address: internal.address
          }
          return;
        }
      });
      if (!mainDomain) {
        result.data.custom.forEach(function(custom) {
          if (custom.main) {
            mainDomain = {
              internal: false,
              address: custom.address
            }
            return;
          }
        });
      }
    });

    $scope.copyUrlClick = function() {
      toastr.clear();
      toastr.success('Copy Success!');
    }

    $scope.drilldown = function(row, gb) {
      if ($scope.treeLevel > 1)
        return;

      var group = pageStatus.groupBy[0];
      $scope.filters.push({ key: group, val: row.id });

      var trafficId;
      if (group == "campaign") {
        trafficId = row.data.trafficId;
      } else if (group == "traffic") {
        trafficId = row.id;
      }
      if (trafficId) {
        $scope.drilldownTrafficId = trafficId;
      }

      var cacheKey = group + ':' + row.id;
      reportCache.put(cacheKey, {level: $scope.filters.length, name: row.name});

      go(gb.value);
    };

    $scope.removeFilter = function (idx) {
      var page = $scope.filters[idx+1].key;
      for (var i = idx+1; i < $scope.filters.length; i++) {
        var filter = $scope.filters[i];
        var cacheKey = filter.key + ":" + filter.val;
        reportCache.remove(cacheKey);
      }
      $scope.filters.splice(idx+1);
      go(page);
    };

    $scope.goTSReport = function(item) {
      $scope.$state.go('app.report.tsreport', {
        trafficId: item.id
      });
    };

    $scope.addNewCampaign = function() {
      $scope.$state.go('app.report.campaign', {
        'campaign': {
          'isShowAdd': true
        }
      });
    };

    function go(page) {
      getDateRange($scope.query.tz);
      pageStatus.datetype = $scope.datetype;
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
      params.filters = {};
      var ftsArr = [];
      $scope.filters.forEach(function(f) {
        params.filters[f.key] = f.val;
        if(reportCache.get(f.key + ':' + f.val) && reportCache.get(f.key + ':' + f.val).name) {
          ftsArr.push(f.key + '$' + f.val + '$' + reportCache.get(f.key + ':' + f.val).name);
        }
      });
      params.drilldownTrafficId = $scope.drilldownTrafficId;
      params.fts = encodeURIComponent(ftsArr.join('|'));
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
        controller = ['$scope', '$rootScope', '$mdDialog', '$timeout', '$q', 'reportCache', 'Campaign', 'Flow', 'TrafficSource', 'urlParameter', 'Tag', 'AppConstant', 'reportCache', 'UrlValidate', editCampaignCtrl];
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
        controller = 'editLanderCtrl';
      } else if (perfType == 'offer') {
        controller = 'editOfferCtrl';
      } else if (perfType == 'traffic') {
        controller = ['$scope', '$mdDialog', '$rootScope', 'TrafficSource', 'urlParameter', 'AppConstant', 'UrlValidate', editTrafficSourceCtrl];
      } else if (perfType == 'affiliate') {
        controller = ['$scope', '$mdDialog', '$timeout', 'AffiliateNetwork', editAffiliateCtrl];
      }

      $mdDialog.show({
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: controller,
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {item: item, perfType: perfType, duplicate: !!duplicate, cache: cache},
        bindToController: true,
        targetEvent: ev,
        templateUrl: editTemplateUrl + "?"+ +new Date()
      }).then(function () {
        getList();
      });
    };

    $scope.deleteItem = function (ev, items) {
      if (!$scope.canEdit) {
        return;
      }

      $mdDialog.show({
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: ['$mdDialog', '$injector', deleteCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        targetEvent: ev,
        locals: {type: perfType, dataArr: items.map(function(item) { return item.data; })},
        bindToController: true,
        templateUrl: 'tpl/delete-confirm-dialog.html?' + +new Date()
      }).then(function () {
        getList();
      });
    };

    $scope.restoreItem = function (ev, items) {
      if (!$scope.canEdit) {
        return;
      }
      $mdDialog.show({
        clickOutsideToClose: true,
        escapeToClose: false,
        controller: ['$mdDialog', '$injector', restoreCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        targetEvent: ev,
        locals: {type: perfType, dataArr: items.map(function(item) { return item.data; })},
        bindToController: true,
        templateUrl: 'tpl/delete-confirm-dialog.html?' + +new Date()
      }).then(function () {
        getList();
      });
    };

    $scope.viewColumnIsShow = false;
    $scope.viewColumnClick = function () {
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
    };
    // todo: use array for report visible columns
    $scope.applyChange = function ($event) {
      $event.stopPropagation();
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
      var reportViewColumnsTemp = $scope.preferences.reportViewColumns = angular.copy($scope.reportViewColumns);
      // remove later
      /*reportViewColumnsTemp.affiliateName.visible = true;
      reportViewColumnsTemp.campaignName.visible = true;
      reportViewColumnsTemp.flowName.visible = true;
      reportViewColumnsTemp.landerName.visible = true;
      reportViewColumnsTemp.offerName.visible = true;
      reportViewColumnsTemp.trafficName.visible = true;*/
      //
      var preferences = {
        json: $scope.preferences
      };
      Preference.save(preferences);
      rerenderReportTable();
    };

    $scope.checkboxIsChecked = function ($event, num) {
      $event.stopPropagation();
      $scope.reportViewColumns[num].visible = !$scope.reportViewColumns[num].visible;
    };
    $scope.checkboxInput = function($event){
      $event.stopPropagation();
    };
    $scope.viewCloumnClose = function ($event) {
      $event.stopPropagation();
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
    };

    var params = $scope.$state.params[perfType];
    if(params && params.isShowAdd) {
      $scope.editItem();
    }

    function getDateRange(timezone) {
      // var fromDate = DateRangeUtil.fromDate(value, timezone);
      // var toDate = DateRangeUtil.toDate(value, timezone);
      // if (value == '0') {
      //   pageStatus.from = moment($scope.fromDate).format('YYYY-MM-DD') + 'T' + $scope.fromTime;
      //   pageStatus.to = moment($scope.toDate).format('YYYY-MM-DD') + 'T' + $scope.toTime;
      //
      //   LocalStorageUtil.setValue(value, moment($scope.fromDate).format('YYYY-MM-DD'), $scope.fromTime, moment($scope.toDate).format('YYYY-MM-DD'), $scope.toTime);
      // } else {
      //   $scope.fromTime = "00:00";
      //   $scope.toTime = "00:00";
      //   pageStatus.from = fromDate + 'T' + $scope.fromTime;
      //   pageStatus.to = toDate + 'T' + $scope.toTime;
      //
      //   LocalStorageUtil.setValue(value, fromDate, $scope.fromTime, toDate, $scope.toTime);
      // }
      pageStatus.from = moment($scope.datePicker.date.startDate).format('YYYY-MM-DD') + 'T00:00';
      pageStatus.to = moment($scope.datePicker.date.endDate).add(1, 'days').format('YYYY-MM-DD') + 'T00:00';
    }

    $scope.initDefaultCustomDate = function(datetype) {
      if (datetype == "0") {
        var fromDate = DateRangeUtil.fromDate(datetype, $scope.query.tz);
        var toDate = DateRangeUtil.toDate(datetype, $scope.query.tz);
        $scope.fromDate = fromDate;
        $scope.toDate = toDate;
      }
    }

    if (perfType == 'campaign') {
      var cache = reportCache.get('campaign-cache');
      if (cache) {
        reportCache.remove('campaign-cache');
        $scope.editItem(null, {}, false, cache);
      }
    } else if (perfType == 'offer') {
      var cache = reportCache.get('offer-cache');
      if(cache) {
        reportCache.remove('offer-cache');
        $scope.editItem(null, {}, false, cache);
      }
    }

    $scope.isNeedCurrency = function(key) {
      return ['cost', 'revenue', 'epv', 'epc', 'ap', 'profit'].indexOf(key) > -1;
    }

    $scope.isNeedPercent = function(key) {
      return ['ctr', 'cr', 'cv', 'roi'].indexOf(key) > -1;
    }

    function initEvent() {
      $('.table-box').on('click', '.check-all', function() {
        var $items = $('#repeater_container').find('.check-item');
        if($(this).is(':checked')) {
          $items.prop('checked', true);
          $scope.reportSelectedIdsChanged('eq', $.map($items, function(item) {return $(item).val()}))
        } else {
          $items.prop('checked', false);
          $scope.reportSelectedIdsChanged('eq', []);
        }
      });
      $('#repeater_container').on('click', '.check-item', function() {
        var $this = $(this);
        if($this.is(':checked') && $('#repeater_container .check-item').length == $('#repeater_container .check-item:checked').length) {
          $('.check-all').prop('checked', true);
        } else {
          $('.check-all').prop('checked', false);
        }
        if($this.is(':checked')) {
          $scope.reportSelectedIdsChanged('push', $this.val());
        } else {
          $scope.reportSelectedIdsChanged('splice', $this.val());
        }
      });
      $('#repeater_container').on('click', '.toggle-row', function() {
        var index = $(this).attr('data-index');
        var row = $scope.report.rows[index];
        $scope.toggleRow(row);
      });

      $('#repeater_container').on('click', '.report-name', function() {
        var row = $scope.report.rows[$(this).closest('tr').attr('data-index')];
        $.contextMenu('destroy');
        if (perfType == 'ip') {
          return;
        }

        if (row.treeLevel > 1) {
          return;
        }

        var idName = (Math.random() + '').slice(2);
        $(this).attr('id', idName);
        initContextMenu(idName);

        var id = perfType == 'campaign' ? row.data.trafficId : perfType == 'traffic' ? row.id : '';
        if(!id) {
          return;
        }
        TrafficSource.get({id: id}, function (traffic) {
          if (traffic.status) {
            // drilldown v1-v10的名字
            var params = JSON.parse(traffic.data.params);
            $scope.groupByOptions.forEach(function(option, index) {
              if (option.role == 'campaign') {
                var idx = option.value.substring(1);
                var parameter = params[idx-1].Name;
                  if(parameter) {
                    $scope.groupByOptions[index].paramValue = parameter;
                    $('.contextmenu-report').find('.' + $scope.groupByOptions[index].value).html(': ' + parameter);
                  } else {
                    $scope.groupByOptions[index].paramValue = 'N/A';
                    $('.contextmenu-report').find('.' + $scope.groupByOptions[index].value).html(': N/A');
                  }
              }
            });
            // copy campaignUrl
            if (perfType == 'campaign') {
              var urlParams = spliceUrlParams(traffic.data);
              if (!mainDomain) {
                return;
              }
              var copyCampaignUrl = 'http://';
              if (mainDomain.internal) {
                copyCampaignUrl += $scope.profile.idText + '.';
              }
              copyCampaignUrl += mainDomain.address + '/' + row.data.campaignHash;
              if (!traffic.data.impTracking) {
                copyCampaignUrl += urlParams;
              }
              $scope.copyCampaignUrl = copyCampaignUrl;
            }
          }
        });
      });
    }

    function rerenderReportTable() {
      var tempHtml = $.temp($('#report-tpl').html(), {
        report: {
          rows: $scope.report.rows,
          treeLevel: $scope.treeLevel,
          canEdit: $scope.canEdit(),
          columns: $scope.columns,
          reportViewColumns: $scope.preferences.reportViewColumns,
          activeStatusIsDisabled: $scope.activeStatusIsDisabled(),
          groupByOne: $scope.groupBy[0]
        }
      });
      $('#repeater_container').empty().append(tempHtml);
    }

    function initContextMenu(idName) {
      var groupByOptions = {};
      $scope.groupByOptions.forEach(function(groupByOption) {
        var displayName = groupByOption.role == 'campaign' && groupByOption.paramValue ? groupByOption.display + '<em class="' + groupByOption.value + '">: ' +  groupByOption.paramValue + '</em>' : groupByOption.display + '<em class="' + groupByOption.value + '"></em>';
        groupByOptions[groupByOption.value] = {
          name: displayName,
          isHtmlName: true,
          visible: function(key, opt) {
            return $scope.drilldownFilter(groupMap[key]);
          }
        }
      });

      var index = $('#' + idName).closest('tr').attr('data-index'), row = $scope.report.rows[index];
      var visible = $scope.canEdit(row) && !row.data.deleted;
      var restoreVisible = $scope.canEdit(row) && !!row.data.deleted;
      var previewOrcopyurlVisible = $scope.canEdit(row) && $scope.perfType=='campaign';
      var fold1Visible = $scope.treeLevel == 1;

      $.contextMenu({
        selector: '#' + idName,
        className: 'contextmenu-report',
        delay: 0,
        trigger: 'left',
        zIndex: 101,
        callback: function(key, options) {
          if(key == 'edit') {
            $scope.editItem(null, row)
          } else if (key == 'duplicate') {
            $scope.editItem(null, row, true);
          } else if(key == 'delete') {
            $scope.deleteItem(null, [row]);
          } else if (key == 'restore') {
            $scope.restoreItem(null, [row]);
          } else if (key == 'preview') {
            window.open($scope.copyCampaignUrl);
          } else if (key == 'copyurl') {
            var node = $document[0].createElement('textarea');
            node.style.position = 'absolute';
            node.textContent = $scope.copyCampaignUrl;
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
            $scope.copyUrlClick();
          } else {
            $scope.drilldown(row, {value: key});
          }
        },
        items: {
          'edit': {
            name: 'Edit',
            visible: visible
          },
          'duplicate': {
            name: 'Duplicate',
            visible: visible
          },
          'delete': {
            name: 'Delete',
            visible: visible
          },
          'restore': {
            name: 'Restore',
            visible: restoreVisible
          },
          'preview': {
            name: 'Preview',
            isHtmlName: true,
            visible: previewOrcopyurlVisible
          },
          'copyurl': {
            name: 'Copy Url',
            isHtmlName: true,
            visible: previewOrcopyurlVisible
          },
          'fold1': {
            'name': 'Drilldown by...',
            visible: fold1Visible,
            items: groupByOptions
          }
        }
      });
    }

    initEvent();
  }

  function editCampaignCtrl($scope, $rootScope, $mdDialog , $timeout, $q, reportCache, Campaign, Flow, TrafficSource, urlParameter, Tag, AppConstant, reportCache, UrlValidate) {
    $scope.pathRoute = 'tpl/flow-edit.html?' + +new Date();
    var prefixCountry = '', prefixTraffic = '';
    $scope.prefix = '';
    initTags($scope, Tag, 1);
    // init load data
    var initPromises = [], prms;
    var theCampaign;
    $scope.checkNameParams = {
      type: 1
    };
    if (this.cache) {
      $scope.renderCampaignCachePathData = angular.copy(this.cache.flow);
      theCampaign = this.cache;
      this.title = theCampaign.id ? 'edit' : 'add';
      if(theCampaign.id) {
        $scope.checkNameParams.id = theCampaign.id;
      }
    } else if (this.item) {
      var isDuplicate = $scope.isDuplicate = this.duplicate;
      prms = Campaign.get({id: this.item.data.campaignId}, function(campaign) {
        theCampaign = campaign.data;
        if (isDuplicate) delete theCampaign.id;
      }).$promise;
      initPromises.push(prms);

      this.title = "edit";
      if(!isDuplicate) {
        $scope.checkNameParams.id = this.item.data.campaignId;
      }
    } else {
      $scope.item = defaultItem();
      this.title = "add";
      $scope.tagsFilter.options = $scope.item.tags = [];
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
        $scope.oldTargetType = theCampaign.targetType;
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
        $scope.item.tags.forEach(function(v) {
          $scope.tags.push(v.name);
        });
        $scope.tagsFilter.options = $scope.item.tags;
        if ($scope.item.trafficSourceId)
          $scope.trafficSourceId = $scope.item.trafficSourceId.toString();
        if ($scope.item.targetFlowId && $scope.item.targetType == 1) {
          $scope.item.flow = {
            id: $scope.item.targetFlowId.toString()
          };
          // showFlow();
        }
        if($scope.item.targetFlowId && $scope.item.targetType == 3) {
          $scope.$broadcast('targetPathIdChanged', {flowId: $scope.item.targetFlowId, isDuplicate: $scope.isDuplicate});
        } else {
          $scope.$broadcast('targetPathIdChanged', {flowId: ''});
        }
        if ($scope.item['costModel'] == null) {
          $scope.item = defaultItem();
        }
        $scope.countries.forEach(function(v) {
          if(v.value == $scope.item.country) {
            $scope.$broadcast('targetPathCountryChanged', {country: v});
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
        $scope.prefix = prefixTraffic + prefixCountry;
      } else {
        prefixCountry = 'Global - ';
        prefixTraffic = allTraffic.length > 0 ? allTraffic[0].name + ' - ' : '';
        $scope.prefix = $scope.item.name = $scope.oldName = prefixTraffic + prefixCountry;
        $scope.trafficSourceId = allTraffic.length > 0 ? allTraffic[0].id.toString(): null;
        $scope.item.country = 'ZZZ';
        $scope.$broadcast('targetPathIdChanged', {flowId: ''});
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
            fillParamsByTraffic(traffic);
            return;
          }

        });
      });
    }
    function fillParamsByTraffic(traffic) {
      var impParam = spliceUrlParams(traffic);
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
    $scope.validateCallback = function(isValid) {
      $scope.editForm.name.$setValidity('asyncCheckName', isValid);
    };

    $scope.postValidateCallback = function() {
      return $scope.item.name.length == $scope.prefix.length;
    };
    function nameRequired() {
      if ($scope.prefix.length == $scope.item.name.length) {
        $scope.editForm.name.$setValidity('nameRequired', false);
        return 0;
      } else {
        $scope.editForm.name.$setValidity('nameRequired', true);
        return 1;
      }
    };

    $scope.nameRequired = nameRequired;
    $scope.nameChanged = function(name) {
      var prefix = $scope.prefix;
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
      nameRequired();
    };
    var oldCountryName;
    $scope.$watch('item.country', function(newCountry, oldCountry) {
      if (newCountry && !oldCountry) {
        oldCountryName = newCountry;
      }
      if (newCountry && oldCountry) {
        oldCountryName = oldCountry;
      }
    });

    $scope.$on('targetPathCountryReseted', function() {
      $scope.item.country = oldCountryName;
      $scope.countryChanged(oldCountryName, true);
    });

    $scope.countryChanged = function(country, reset) {
      if(!reset) {
        var countryObj = $scope.countries.filter(function(c) {
          return c.value == country;
        });
        $scope.$broadcast('targetPathCountryChanged', {country: countryObj[0]});
      }
      $scope.countries.forEach(function(v) {
        if(v.value == country) {
          prefixCountry = v.display + ' - ';
          return;
        }
      });
      var preStr = prefixTraffic + prefixCountry;
      $scope.item.name = preStr + $scope.item.name.substr($scope.prefix.length);
      $scope.oldName = preStr + $scope.oldName.substr($scope.prefix.length);
      $scope.prefix = preStr;
    }

    $scope.trafficSourceChanged = function(id) {
      $scope.trafficSources.forEach(function(v) {
        if(v.id == id) {
          prefixTraffic = v.name + ' - ';
          return;
        }
      });
      var preStr = prefixTraffic + prefixCountry;
      $scope.item.name = preStr + $scope.item.name.substr($scope.prefix.length);
      $scope.oldName = preStr + $scope.oldName.substr($scope.prefix.length);
      $scope.prefix = preStr;
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
      if(!$scope.item.flow.id) return;
      // Get Flow by Id
      Flow.get({id: $scope.item.flow.id}, function (flow) {
        $scope.flow = flow.data;

        $scope.flow.rules && $scope.flow.rules.forEach(function(rule) {
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
      cacheData.targetFlowId = $scope.item.flow ? $scope.item.flow.id : '';
      if ($scope.item.costModel != 0 && $scope.item.costModel != 4) {
        cacheData[$scope.radioTitle.toLowerCase() + 'Value'] = $scope.costModelValue;
      }
      reportCache.put('campaign-cache', cacheData);
      $scope.$broadcast('cacheCampaignStarted', {});
    }

    // cacheData success
    $scope.$on('pathCacheDataSuccessed', function(event, oData) {
      var cacheCampaignData = reportCache.get('campaign-cache');
      reportCache.remove('campaign-cache');
      cacheCampaignData.flow = oData.data;
      cacheCampaignData.flow.onEdit = oData.onEdit;
      cacheCampaignData.flow.curRule = oData.curRule;
      cacheCampaignData.flow.curPath = oData.curPath;
      reportCache.put('campaign-cache', cacheCampaignData);
    });

    // Path new Offer
    $scope.$on('pathCacheDataPedding', function(event, oData) {
      saveCacheData();
    });

    $scope.$on('pathCacheDataCancled', function(event, oData) {
      reportCache.remove('campaign-cache');
    });

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
      reportCache.remove('campaign-cache');
    };

    this.close = function() {
      $mdDialog.hide();
      reportCache.remove('campaign-cache');
    };

    function defaultItem() {
      return {
        costModel: 0,
        redirectMode: 0,
        targetType: 1,
        status: 1,
      };
    }

    $scope.validateUrl = function () {
      $scope.item.targetUrl = UrlValidate.addHttp($scope.item.targetUrl);
      var isValid = UrlValidate.validate($scope.item.targetUrl);
      $scope.editForm.targetUrl.$setValidity('urlformat', isValid);
    };

    function success(item) {
      $scope.saveStatus = false;
      if(item.data.status == 0) {
        $scope.errMessage = item.message;
        return;
      }
      var campaign = item.data;
      $scope.item.url = campaign.url;
      $scope.item.impPixelUrl = campaign.impPixelUrl;
      $scope.item.hash = campaign.hash;
      $scope.impPixelUrl = campaign.impPixelUrl;
      $scope.campaignUrl = campaign.url;

      var traffic = JSON.parse($scope.item.trafficSource);
      fillParamsByTraffic(traffic);
      if (!$scope.item.id) {
        $scope.campaignAddStatus = true;
        $scope.item.id = campaign.id;
        $scope.item.targetFlowId = item.data.targetFlowId;
        $scope.$broadcast('saveCampaignEnd', {flow: item.data.flow});
        $('#dialogContent_campaign_edit_content').scrollTop(0);
        return;
      }
      $mdDialog.hide();
    }

    this.save = function() {
      if($scope.item.targetType == 3) {
        $scope.$broadcast('saveCampaignStarted');
      } else {
        saveCampaign();
      }
      reportCache.remove('campaign-cache');
    };

    $scope.$on('pathDataSuccessed', function(event, oData) {
      if(oData.status) {
        saveCampaign(oData.data);
      } else {
        // TODO show error
      }
      reportCache.remove('campaign-cache');
    });

    function saveCampaign(pathData) {
      // cost model value
      if(!nameRequired()) return;
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

      // path
      var tempFlowId;
      if($scope.item.targetType == 3) {
        $scope.item['flow'] = {
          rules: pathData.rules,
          name: 'defaultName',
          type: 0,
          redirectMode: $scope.item.redirectMode,
          country: $scope.item.country
        };
        if($scope.item.targetFlowId) {
          tempFlowId = $scope.item.targetFlowId;
        }
      }

      delete $scope.item.trafficSourceId;
      delete $scope.item.targetFlowId;
      delete $scope.item.trafficSourceName;
      delete $scope.item.impPixelUrl;
      delete $scope.item.url;
      delete $scope.item['cpcValue'];
      delete $scope.item['cpaValue'];
      delete $scope.item['cpmValue'];

      if ($scope.item.targetType != 3 && $scope.item.flow) {
        delete $scope.item.flow.curPath;
        delete $scope.item.flow.curRule;
        delete $scope.item.flow.onEdit;
        delete $scope.item.flow.rules;
      }

      // if (!$scope.item['flow']) {
      //   $scope.item['flow'] = {
      //     type: 0,
      //     name: 'defaultName',
      //     redirectMode: 0
      //   };
      // }
      $scope.editForm.$setSubmitted();
      if ($scope.editForm.$valid) {
        $scope.saveStatus = true;
        var item = angular.copy($scope.item);
        if (tempFlowId && !$scope.isDuplicate && ($scope.oldTargetType == 3 || $scope.oldTargetType == undefined)) {
          item['flow'].id = tempFlowId;
        }
        Campaign.save(item, success);
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
      saveCacheData();
      $scope.$parent.$state.go('app.report.traffic', {
        'traffic': {
          'isShowAdd': true
        },
        frcpn: 1
      });
    };

  }

  function editLanderCtrl($scope, $rootScope, $mdDialog, Lander, urlParameter, Tag, AppConstant, Setup, $timeout, UrlValidate) {
    $scope.prefix = this.country ? this.country.display + ' - ' : 'Global - ';
    initTags($scope, Tag, 2);
    $scope.checkNameParams = {
      type: 2
    };
    Setup.get(null, function (setup) {
      $scope.clickUrl = setup.data.clickUrl;
    });
    $scope.btnWord = "Clipboard";
    $scope.itemUrlClick = function(){
      $scope.btnWord = "Copied";
      $timeout(function() {
        $scope.btnWord = "Clipboard";
      }, 2000);
    };
    if (this.item) {
      var isDuplicate = this.duplicate;
      Lander.get({id: this.item.data.landerId}, function (lander) {
        $scope.item = angular.copy(lander.data);
        if (isDuplicate) {
          delete $scope.item.id;
          delete $scope.item.hash;
        }
        $scope.item.tags.forEach(function(v) {
          $scope.tags.push(v.name);
        });
        $scope.tagsFilter.options = $scope.item.tags;
        // $scope.item = {
        //   numberOfOffers: 1,
        // };
        if($scope.item.country) {
          $scope.countries.forEach(function(v) {
            if(v.value == $scope.item.country) {
              $scope.prefix = v.display + ' - ';
              return;
            }
          });
        }
        $scope.oldName = $scope.item.name;
      });
      if(!isDuplicate) {
        $scope.checkNameParams.id = this.item.data.landerId;
      }
      this.title = "edit";
    } else {
      $scope.item = {
        numberOfOffers: 1
      };
      this.title = "add";
      $scope.item.name = $scope.prefix;
      $scope.oldName = $scope.item.name;
      $scope.item.country = this.country ? this.country.value : 'ZZZ';
    }

    if(this.country && this.country.value != "ZZZ") {
      $scope.countryInputDisabled = true;
    }

    this.titleType = angular.copy(this.perfType);
    $scope.validateCallback = function(isValid) {
      $scope.editForm.name.$setValidity('asyncCheckName', isValid);
    };

    $scope.postValidateCallback = function() {
      return $scope.item.name.length == $scope.prefix.length;
    };
    function nameRequired() {
      if ($scope.prefix.length == $scope.item.name.length) {
        $scope.editForm.name.$setValidity('nameRequired', false);
        return 0;
      } else {
        $scope.editForm.name.$setValidity('nameRequired', true);
        return 1;
      }
    };
    $scope.nameRequired = nameRequired;
    $scope.nameChanged = function() {
      var prefix = $scope.prefix;
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
      nameRequired();
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
      $scope.item.name = preStr + $scope.item.name.substr($scope.prefix.length);
      $scope.oldName = preStr + $scope.oldName.substr($scope.prefix.length);
      $scope.prefix = preStr;
    }

    // Country
    $scope.countries = $scope.$root.countries;

    this.cancel = $mdDialog.cancel;

    function success(item) {
      $scope.saveStatus = false;
      if(item.data.status == 0) {
        $scope.errMessage = item.message;
        return;
      } else {
        $mdDialog.hide(item);
      }
    }

    this.save = function () {
      if(!nameRequired()) return;
      $scope.item.tags = $scope.tags;
      $scope.editForm.$setSubmitted();
      if ($scope.editForm.$valid) {
        $scope.saveStatus = true;
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
      $scope.item.url = UrlValidate.addHttp($scope.item.url);
      var isValid = UrlValidate.validate($scope.item.url);
      $scope.editForm.url.$setValidity('urlformat', isValid);
    };

  }

  function editOfferCtrl($scope, $mdDialog, $rootScope, $q, $timeout, Offer, AffiliateNetwork, urlParameter, DefaultPostBackUrl, Tag, AppConstant, reportCache, UrlValidate) {
    //var prefixCountry = '', prefixAffiliate = '';
    $scope.prefixCountry = '';
    $scope.prefixAffiliate = '';
    $scope.prefix = '';
    $scope.timezones = $rootScope.timezones;
    // $scope.capTimezoneId = $rootScope.profileTimezone;
    initTags($scope, Tag, 3);
    initCountries($scope);
    // init load data
    var initPromises = [], prms;

    $scope.checkNameParams = {
      type: 3
    };
    if(this.cache) {
      var theOffer = this.cache;
      if(theOffer.id) {
        $scope.checkNameParams.id = theOffer.id;
        this.title = "edit";
      } else {
        this.title = "add";
      }
    } else if (this.item) {
      var isDuplicate = this.duplicate;
      var theOffer;
      prms = Offer.get({id: this.item.data.offerId}, function(offer) {
        theOffer = offer.data;
        if (isDuplicate) {
          delete theOffer.id;
          delete theOffer.hash;
        }
      }).$promise;
      initPromises.push(prms);

      this.title = "edit";
      if (!isDuplicate) {
        $scope.checkNameParams.id = this.item.data.offerId;
      }
    } else {
      $scope.item = {
        payoutMode: 0,
        capEnabled: 0
      };
      $scope.affiliateId = "0";
      this.title = "add";
      $scope.tagsFilter.options = $scope.item.tags = [];
      processPrefixCountry($scope, "");
      $scope.prefix = $scope.item.name = $scope.oldName = $scope.prefixCountry;
      // 初始化country,默认选中Global
      initDefaultCountry();
    }

    var defaultPostBackUrl;
    prms = DefaultPostBackUrl.get(null, function (postbackUrl) {
      defaultPostBackUrl = postbackUrl.data.defaultPostBackUrl;
    }).$promise;
    initPromises.push(prms);

    var allAffiliate;
    prms = AffiliateNetwork.get(null, function (affiliates) {
      allAffiliate = affiliates.data.affiliates;
    }).$promise;
    initPromises.push(prms);

    var offers;
    prms = Offer.query({ids: this.item && this.item.data.offerId ? this.item.data.offerId : ''}, function (oData) {
      offers = oData;
    }).$promise;
    initPromises.push(prms);

    function initSuccess() {
      $scope.affiliates = allAffiliate;
      $scope.offers = offers;
      if (theOffer) {
        $scope.item = theOffer;
        $scope.affiliateId = theOffer.AffiliateNetworkId.toString();
        $scope.item.tags.forEach(function(v) {
          $scope.tags.push(v.name);
        });
        $scope.tagsFilter.options = $scope.item.tags;

        var countries = processPrefixCountry($scope, $scope.item.country);
        if (countries.indexOf('ZZZ') == -1) {
          var allCountry = angular.copy($scope.$root.countries);
          allCountry.forEach(function(country, index) {
            if (country.value == 'ZZZ') {
              allCountry.splice(index, 1);
              return false;
            }
          });
          $scope.countryFilter.options = allCountry;
          $scope.countries = countries;
        } else {
          initDefaultCountry();
        }

        $scope.affiliates.forEach(function(v) {
          if(v.id == $scope.item.AffiliateNetworkId) {
            $scope.prefixAffiliate = v.name + ' - ';
            return;
          }
        });
        $scope.oldName = $scope.item.name;
        $scope.prefix = $scope.prefixAffiliate + $scope.prefixCountry;
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

    $scope.validateCallback = function(isValid) {
      $scope.editForm.name.$setValidity('asyncCheckName', isValid);
    };

    $scope.postValidateCallback = function() {
      return $scope.item.name.length == $scope.prefix.length;
    };

    $scope.nameChanged = function(name) {
      if(name == undefined || name.length < $scope.prefix.length) {
        $scope.item.name = $scope.prefix;
      } else if(name.indexOf($scope.prefix) != 0) {
        var sub = name.substr(0, $scope.prefix.length);
        var arr1 = $scope.prefix.split('');
        var arr2 = sub.split('');
        var inputText = '';
        for(var i = 0, l = $scope.prefix.length; i < l; i++) {
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

    function nameRequired() {
      if ($scope.prefix.length == $scope.item.name.length) {
        $scope.editForm.name.$setValidity('nameRequired', false);
        return 0;
      } else {
        $scope.editForm.name.$setValidity('nameRequired', true);
        return 1;
      }
    };

    $scope.nameRequired = nameRequired;

    $scope.affiliateChanged = function(id) {
      $scope.affiliates.forEach(function(v) {
        if(v.id == id) {
          $scope.prefixAffiliate = v.name + ' - ';
          return;
        }
      });
      processOfferName($scope);
    };

    $q.all(initPromises).then(initSuccess);

    this.titleType = angular.copy(this.perfType);

    this.cancel = function() {
      $mdDialog.hide();
    };

    $scope.validateUrl = function () {
      $scope.item.url = UrlValidate.addHttp($scope.item.url);
      var isValid = UrlValidate.validate($scope.item.url);
      $scope.editForm.url.$setValidity('urlformat', isValid);
    };

    function success(item) {
      $scope.saveStatus = false;
      if(item.data.status == 0) {
        $scope.errMessage = item.message;
        return;
      } else {
        $mdDialog.hide(item);
      }
    }

    this.save = function () {
      if(!nameRequired()) return;
      $scope.item.tags = $scope.tags;
      $scope.item.country = $scope.countries.join(',');

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
        $scope.saveStatus = true;
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
      saveCacheData();
      $scope.$parent.$state.go('app.report.affiliate', {
        'affiliate': {
          'isShowAdd': true
        },
        'frcpn': self.frcpn ? self.frcpn : 4
      });
    }

    function saveCacheData() {
      var cacheData = angular.copy($scope.item);
      cacheData.AffiliateNetworkId = $scope.affiliateId;
      reportCache.put('offer-cache', cacheData);
    }

    $scope.btnWord = "Clipboard";
    $scope.itemUrlClick = function(){
      $scope.btnWord = "Copied";
      $timeout(function() {
        $scope.btnWord = "Clipboard";
      }, 2000);
    };

    function initDefaultCountry() {
      $scope.countries = ['ZZZ'];
      $scope.countryFilter.options = [{"value": "ZZZ", "display": "Global"}];
    }
  }

  function editTrafficSourceCtrl($scope, $mdDialog, $rootScope, TrafficSource, urlParameter, AppConstant, UrlValidate) {
    var fromCampaign = $scope.$parent.$stateParams.frcpn == '1';
    var fromFlow = $scope.$parent.$stateParams.frcpn == '2';

    $scope.urlPattern = new RegExp(AppConstant.URLREG, 'i');
    $scope.checkNameParams = {
      type: 5
    };
    if (this.item) {
      var isDuplicate = this.duplicate;
      TrafficSource.get({id: this.item.data.trafficId}, function (trafficsource) {
        $scope.item = angular.copy(trafficsource.data);
        if (isDuplicate) {
          delete $scope.item.id;
          delete $scope.item.hash;
        } else {
          $scope.checkNameParams.id = $scope.item.id;
        }
        if($scope.item.cost) {
          $scope.cost = JSON.parse($scope.item.cost);
        } else {
          $scope.cost = {
            Parameter: '', Placeholder: '', Name: ''
          };
        }
        if ($scope.item.externalId) {
          $scope.externalId = JSON.parse($scope.item.externalId);
        } else {
          $scope.externalId = {
            Parameter: '', Placeholder: '', Name: ''
          };
        }
        if ($scope.item.campaignId) {
          $scope.campaignId = JSON.parse($scope.item.campaignId);
        } else {
          $scope.campaignId = {
            Parameter: '', Placeholder: '', Name: ''
          };
        }
        if ($scope.item.websiteId) {
          $scope.websiteId = JSON.parse($scope.item.websiteId);
        } else {
          $scope.websiteId = {
            Parameter: '', Placeholder: '', Name: ''
          };
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
      $scope.externalId = {
        Parameter: '', Placeholder: '', Name: ''
      };
      $scope.cost = {
        Parameter: '', Placeholder: '', Name: ''
      };
      $scope.campaignId = {
        Parameter: '', Placeholder: '', Name: ''
      };
      $scope.websiteId = {
        Parameter: '', Placeholder: '', Name: ''
      };
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

    this.cancel = function() {
      if (fromCampaign) {
        $scope.$parent.$state.go('app.report.campaign');
      } else if (fromFlow) {
        $scope.$parent.$state.go('app.report.flow');
      }
      $mdDialog.cancel();
    };

    function success(item) {
      $scope.saveStatus = false;
      if(item.data.status == 0) {
        $scope.errMessage = item.message;
        return;
      } else {
        if(fromCampaign) {
          $scope.$parent.$state.go('app.report.campaign');
          $mdDialog.cancel();
        } else {
          $mdDialog.hide(item);
        }
      }
    }

    this.save = function () {
      $scope.item.params = JSON.stringify($scope.params);
      $scope.item.cost = JSON.stringify($scope.cost);
      $scope.item.externalId = JSON.stringify($scope.externalId);
      $scope.item.campaignId = JSON.stringify($scope.campaignId);
      $scope.item.websiteId = JSON.stringify($scope.websiteId);
      $scope.editForm.$setSubmitted();

      if ($scope.editForm.$valid) {
        $scope.saveStatus = true;
        TrafficSource.save($scope.item, success);
      }
    };

    $scope.validateUrl = function () {
      $scope.item.postbackUrl = UrlValidate.addHttp($scope.item.postbackUrl);
      var isValid = UrlValidate.validate($scope.item.postbackUrl);
      $scope.editForm.postbackUrl.$setValidity('urlformat', isValid);
    };

    $scope.validateCallback = function(isValid) {
      $scope.editForm.name.$setValidity('asyncCheckName', isValid);
    };

    $scope.postValidateCallback = function() {
      return $scope.item.name == "";
    };

    function nameRequired() {
      if (!$scope.item.name) {
        $scope.editForm.name.$setValidity('nameRequired', false);
        return 0;
      } else {
        $scope.editForm.name.$setValidity('nameRequired', true);
        return 1;
      }
    };

    $scope.nameRequired = nameRequired;

    $scope.urlItem = urlParameter["traffic"];
    $scope.urlTokenClick = function(url){
      $rootScope.$broadcast('add', url, "postbackUrl");
    };

    $scope.visible = true;
    $scope.toggleShow = function(){
      $scope.isActive = !$scope.isActive;
      $scope.visible = !$scope.visible;
    };

    $scope.$watch('externalId.Parameter', function (newValue, oldValue) {
      if (!newValue && !oldValue) {
        return;
      }
      var placeholder = $scope.externalId.Placeholder;
      if (!placeholder && !newValue) {
        return;
      }
      if (!placeholder && newValue) {
        $scope.externalId.Placeholder = '{' + newValue + '}';
        return;
      }
      oldValue = "{" + oldValue + "}";
      if (placeholder && !newValue) {
        if (oldValue == placeholder) {
          $scope.externalId.Placeholder = "";
          return;
        }
      }
      if (placeholder && newValue) {
        if (oldValue == placeholder) {
          $scope.externalId.Placeholder = '{' + newValue + '}';
          return;
        }
      }
    });

    $scope.$watch('cost.Parameter', function (newValue, oldValue) {
      if (!newValue && !oldValue) {
        return;
      }
      var placeholder = $scope.cost.Placeholder;
      if (!placeholder && !newValue) {
        return;
      }
      if (!placeholder && newValue) {
        $scope.cost.Placeholder = '{' + newValue + '}';
        return;
      }
      oldValue = "{" + oldValue + "}";
      if (placeholder && !newValue) {
        if (oldValue == placeholder) {
          $scope.cost.Placeholder = "";
          return;
        }
      }
      if (placeholder && newValue) {
        if (oldValue == placeholder) {
          $scope.cost.Placeholder = '{' + newValue + '}';
          return;
        }
      }
    });

    $scope.$watch('campaignId.Parameter', function (newValue, oldValue) {
      if (!newValue && !oldValue) {
        return;
      }
      var placeholder = $scope.campaignId.Placeholder;
      if (!placeholder && !newValue) {
        return;
      }
      if (!placeholder && newValue) {
        $scope.campaignId.Placeholder = "{" + newValue + "}";
        return;
      }
      oldValue = "{" + oldValue + "}";
      if (placeholder && !newValue) {
        if (oldValue == placeholder) {
          $scope.campaignId.Placeholder = "";
          return;
        }
      }
      if (placeholder && newValue) {
        if (oldValue == placeholder) {
          $scope.campaignId.Placeholder = "{" + newValue + "}";
          return;
        }
      }
    });

    $scope.$watch('websiteId.Parameter', function (newValue, oldValue) {
      if (!newValue && !oldValue) {
        return;
      }
      var placeholder = $scope.websiteId.Placeholder;
      if (!placeholder && !newValue) {
        return;
      }
      if (!placeholder && newValue) {
        $scope.websiteId.Placeholder = "{" + newValue + "}";
        return;
      }
      oldValue = "{" + oldValue + "}";
      if (placeholder && !newValue) {
        if (oldValue == placeholder) {
          $scope.websiteId.Placeholder = "";
          return;
        }
      }
      if (placeholder && newValue) {
        if (oldValue == placeholder) {
          $scope.websiteId.Placeholder = "{" + newValue + "}";
          return;
        }
      }
    });

    $scope.$watch('params', function (newValue, oldValue) {
      if (!newValue && !oldValue) {
        return;
      }
      newValue.forEach(function (value, index) {
        var parameter = value.Parameter;
        var placeholder = value.Placeholder;
        // params name
        // if (!oldValue || !oldValue[index].Name || value.Name == oldValue[index].Parameter) {
        //   $scope.params[index].Name = $scope.params[index].Parameter;
        // }
        if (oldValue && (value.Name == oldValue[index].Parameter)) {
          $scope.params[index].Name = $scope.params[index].Parameter;
        }
        // params placeholder
        if (!placeholder && parameter) {
          $scope.params[index].Placeholder = "{" + parameter + "}";
        }
        var oldParameter = "";
        if (oldValue) {
          oldParameter = "{" + oldValue[index].Parameter + "}";
        }
        if (placeholder && !parameter) {
          if (oldParameter == placeholder) {
            $scope.params[index].Placeholder = "";
          }
        }
        if (placeholder && parameter) {
          if (oldParameter == placeholder) {
            $scope.params[index].Placeholder = "{" + parameter + "}";
          }
        }

      });
    }, true);

    $scope.selectTrafficSourceTemplate = function (ev) {
      $mdDialog.show({
        multiple: true,
        skipHide: true,
        escapeToClose: false,
        clickOutsideToClose: false,
        controller: ['$scope', '$mdDialog', 'TrafficTemplate', trafficSourceTemplateCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: {},
        bindToController: true,
        targetEvent: ev,
        templateUrl: 'tpl/trafficSource-template-dialog.html?' + +new Date()
      }).then(function(data){
        $scope.item.name = data.name;
        $scope.item.postbackUrl = data.postbackUrl;
        $scope.params = JSON.parse(data.params);
        if ($scope.params.length < 10) {
          var addLength = 10-$scope.params.length;
          for (var i=0;i<addLength;i++) {
            var param = {Parameter: '', Placeholder: '', Name: '', Track: 0};
            $scope.params.push(param);
          }
        }
        $scope.cost = JSON.parse(data.cost);
        $scope.externalId = JSON.parse(data.externalId);
        $scope.campaignId = JSON.parse(data.campaignId);
        $scope.websiteId = JSON.parse(data.websiteId);
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
    var fromOffer = $scope.$parent.$stateParams.frcpn == '4';
    var fromCampaign = $scope.$parent.$stateParams.frcpn == '1';
    var fromFlow = $scope.$parent.$stateParams.frcpn == '2';
    $scope.checkNameParams = {
      type: 6
    };
    if (this.item) {
      var isDuplicate = this.duplicate;
      AffiliateNetwork.get({id: this.item.data.affiliateId}, function (affiliate) {
        $scope.item = angular.copy(affiliate.data.affiliates);
        if (isDuplicate) {
          delete $scope.item.id;
          delete $scope.item.hash;
        } else {
          $scope.checkNameParams.id = $scope.item.id;
        }
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

    this.cancel = function() {
      if(fromOffer) {
        $scope.$parent.$state.go('app.report.offer');
      } else if(fromCampaign) {
        $scope.$parent.$state.go('app.report.campaign');
      } else if (fromFlow) {
        $scope.$parent.$state.go('app.flow');
      }
      $mdDialog.cancel();
    };

    function success(item) {
      $scope.saveStatus = false;
      if(item.data.status == 0) {
        $scope.errMessage = item.message;
        return;
      } else {
        if(fromOffer) {
          $scope.$parent.$state.go('app.report.offer');
          $mdDialog.cancel();
        } else if (fromCampaign) {
          $scope.$parent.$state.go('app.report.campaign');
          $mdDialog.cancel();
        } else if (fromFlow) {
          $scope.$parent.$state.go('app.flow');
          $mdDialog.cancel();
        } else {
          $mdDialog.hide(item);
        }
      }
    }

    this.save = function () {
      if (!$scope.ipWhiteCheck) {
        $scope.item.ipWhiteList = "[]";
      } else {
        var ips = $scope.ipWhiteList.split("\n");
        $scope.item.ipWhiteList = JSON.stringify(ips);
      }
      if(!nameRequired()) {
        return;
      }
      $scope.editForm.$setSubmitted();
      if ($scope.editForm.$valid) {
        $scope.saveStatus = true;
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

    $scope.validateCallback = function(isValid) {
      $scope.editForm.name.$setValidity('asyncCheckName', isValid);
    };

    $scope.postValidateCallback = function() {
      return $scope.item.name == "";
    };

    function nameRequired() {
      if (!$scope.item.name) {
        $scope.editForm.name.$setValidity('nameRequired', false);
        return 0;
      } else {
        $scope.editForm.name.$setValidity('nameRequired', true);
        return 1;
      }
    };

    $scope.nameRequired = nameRequired;

    $scope.trustedAffiliateNetworks = function (ev, item) {
      $mdDialog.show({
        multiple: true,
        skipHide: true,
        escapeToClose: false,
        clickOutsideToClose: false,
        controller: ['$scope', '$mdDialog', 'AffiliateTemplate', affiliateNetworkCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: { item: item, currentUser: $scope.currentUser },
        bindToController: true,
        targetEvent: ev,
        templateUrl: 'tpl/trusted-affiliate-networks-dialog.html?' + +new Date()
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
    var self = this;
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

    function deleteItem(dataArr) {
      var ids = dataArr.map(function(d) {return d.id});
      return $injector.get(resourceName).remove({id: ids, errorFn: true}).$promise;
      // return $injector.get(resourceName).remove({id: item[type+"Id"], hash: item[type+"Hash"], name: item[type+"Name"], errorFn: true}).$promise;
    }

    this.onprocess = false;
    this.ok = function () {
      self.onprocess = true;
      deleteItem(this.dataArr).then(success, error);
    };

    function success(oData) {
      self.onprocess = false;
      if(oData.status == 0) {
        self.error = oData.message || 'Error occured when delete.';
      } else {
        $mdDialog.hide();
      }
    }

    function error() {
      self.onprocess = false;
      self.error = 'Error occurred when delete.';
    }
  }

  function restoreCtrl($mdDialog, $injector) {
    var self = this;
    this.title = "restore";
    this.content = 'warnRestore';
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

    function restoreItem(dataArr) {
      var ids = dataArr.map(function(d) {return d.id});
      return $injector.get(resourceName).save({errorFn: true}, {id: ids.join(','), deleted: 0}).$promise;
      // return $injector.get(resourceName).save({errorFn: true}, {id: item[type+"Id"], deleted: 0}).$promise;
    }

    this.onprocess = false;
    this.ok = function () {
      self.onprocess = true;
      restoreItem(this.dataArr).then(success, error);
    };

    function success(oData) {
      self.onprocess = false;
      if(oData.status == 0) {
        self.error = oData.message || 'Error occured when restore.';
      } else {
        $mdDialog.hide();
      }
    }

    function error() {
      self.onprocess = false;
      self.error = 'Error occurred when restore.';
    }
  }

  function initTags($scope, Tag, type) {
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
    // Tag.get({type: type}, function(oData) {
    //   $scope.tagsFilter.options = oData.data.tags;
    // });
  }

  function initCountries($scope) {
    $scope.countries = [];
    $scope.countryFilter = {
        config: {
            plugins: ['remove_button'],
            valueField: 'value',
            labelField: 'display',
            searchField: ['display'],
            onChange: function(value) {
              var prefixCountry = 'Global';
              if (value.length == 0) {
                $scope.countrySelectize.clearOptions();
                $scope.countrySelectize.addOption(angular.copy($scope.$root.countries));
              } else if (value.indexOf('ZZZ') == -1) {
                $scope.countrySelectize.removeOption('ZZZ');
              } else {
                // 从国家选项里只保留Global
                $scope.countrySelectize.currentResults.items.forEach(function(item) {
                  $scope.countrySelectize.removeOption(item.id);
                });
              }
              $scope.countrySelectize.refreshOptions();

              if (value.length == 1) {
                prefixCountry = $scope.countrySelectize.options[value[0]].display;
              } else if (value.length > 1) {
                prefixCountry = 'Multi';
              }

              $scope.prefixCountry = prefixCountry + ' - ';
              $scope.$apply(processOfferName($scope));
            },
            onInitialize: function(selectize) {
                $scope.countrySelectize = selectize;
            }
        },
        options: []
    };
  }

  function processPrefixCountry($scope, country) {
    var countries = [];
    if (!country) {
      $scope.prefixCountry = 'Global - ';
    } else {
      countries = country.split(',');
      if (countries.length == 1) {
        $scope.prefixCountry = $scope.$root.countryMap[countries[0]].display + ' - ';
      } else {
        $scope.prefixCountry = 'Multi - ';
      }
    }
    return countries;
  }

  function processOfferName($scope) {
    var preStr = $scope.prefixAffiliate + $scope.prefixCountry;
    $scope.item.name = preStr + $scope.item.name.substr($scope.prefix.length);
    $scope.oldName = preStr + $scope.oldName.substr($scope.prefix.length);
    $scope.prefix = preStr;
  }

  function closeConfirmDialog($mdDialog) {
    $mdDialog.show({
      multiple: true,
      skipHide: true,
      escapeToClose: false,
      clickOutsideToClose: false,
      controller: ['$scope', '$mdDialog', closeConfirmCtrl],
      controllerAs: 'ctrl',
      focusOnOpen: false,
      bindToController: true,
      templateUrl: 'tpl/close-confirm-dialog.html?' + +new Date()
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

  function spliceUrlParams(traffic) {
      var params = JSON.parse(traffic.params);
      var impParam = "";
      params.forEach(function (param) {
        if (param.Placeholder && param.Track) {
          impParam = impParam + param.Parameter + "=" + param.Placeholder + "&";
        }
      });

      var cost = JSON.parse(traffic.cost);
      if (cost.Placeholder) {
        impParam = impParam + cost.Parameter + "=" + cost.Placeholder + "&";
      }
      var external = JSON.parse(traffic.externalId);
      if (external.Placeholder) {
        impParam = impParam + external.Parameter + "=" + external.Placeholder + "&";
      }
      var campaignId = JSON.parse(traffic.campaignId);
      if (campaignId.Placeholder) {
        impParam = impParam + campaignId.Parameter + "=" + campaignId.Placeholder + "&";
      }
      var websiteId = JSON.parse(traffic.websiteId);
      if (websiteId.Placeholder) {
        impParam = impParam + websiteId.Parameter + "=" + websiteId.Placeholder + "&";
      }

      if (impParam) {
        impParam = "?" + impParam;
      }
      impParam = impParam.substring(0, impParam.length-1);
      return impParam;
    }

})();
