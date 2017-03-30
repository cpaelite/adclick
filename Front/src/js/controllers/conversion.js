(function () {
  angular.module('app')
  .controller('ConversionCtrl', ['$scope', 'Conversion', 'Preference', 'columnDefinition', 'Profile', 
  ConversionCtrl
  ])
  .directive('resize',['$timeout','$q',function($timeout,$q){
      return function(scope, element) {
        var timeout;
        var w_h = $(window);
        var nav_h = $('nav');
        var filter_h = $('.cs-action-bar-bg');
        var page_h = $('md-table-pagination');
        var breadcrumb_h = $('.breadcrumb-div');
        function getHeight() {
          var deferred = $q.defer();
          $timeout(function() {
            deferred.resolve({
              'w_h': w_h.height(),
              'nav_h': nav_h.height(),
              'filter_h':filter_h.outerHeight(true),
              'page_h':page_h.height(),
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
              'height': (scope.windowHeight - 46 - scope.navHeight - scope.filterHeight - 30 - 33 - scope.pageHeight - 10) + 'px'
            })

          })
        }

        heightResize();

        w_h.bind('resize', function() {
          heightResize();
        });
      }
    }]);

  function ConversionCtrl($scope, Conversion, Preference, columnDefinition, Profile) {
    var pageStatus = {};

    $scope.fromDate = $scope.fromDate || moment().format('YYYY-MM-DD');
    $scope.fromTime = $scope.fromTime || '00:00';
    $scope.toDate = $scope.toDate || moment().add(1, 'days').format('YYYY-MM-DD');
    $scope.toTime = $scope.toTime || '00:00';
    $scope.query = {
      page: 1,
      __tk: 0
    };
    $scope.datetype = '1';
    getDateRange($scope.datetype);
    $scope.hours = [];
    for (var i = 0; i < 24; ++i) {
      if (i < 10) {
        $scope.hours.push('0' + i + ':00');
      } else {
        $scope.hours.push('' + i + ':00');
      }
    }

    $scope.columns = angular.copy(columnDefinition['conversion']);

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

      var unwatch = $scope.$watch('preferences', function (newVal, oldVal) {
        if (!newVal)
          return;
        $scope.reportViewColumns = angular.copy(newVal.reportViewColumns);
        angular.extend($scope.query, {
          limit: newVal.reportViewLimit,
          order: 'PostbackTimestamp'
        });

        unwatch();
        unwatch = null;
      }, true);
    }

    // 获取用户配置信息
    Profile.get(null, function (profile) {
      if (!profile.status) {
        return;
      }
      $scope.profile = profile.data;
      watchFilter();
      $scope.query.tz = $scope.profile.timezone;
    });

    $scope.applySearch = function () {
      $scope.disabled = true;
      getDateRange($scope.datetype);
      $scope.query.page = 1;
      $scope.query.__tk += 1;
    };

    $scope.checkboxIsChecked = function ($event, num) {
      $event.stopPropagation();
      $scope.reportViewColumns[num].visible = !$scope.reportViewColumns[num].visible;
    };
    $scope.checkboxInput = function ($event) {
      $event.stopPropagation();
    };
    $scope.viewCloumnClose = function ($event) {
      $event.stopPropagation();
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
    };
    $scope.viewColumnClick = function () {
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
    };
    $scope.applyChange = function ($event) {
      $event.stopPropagation();
      $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
      $scope.preferences.reportViewColumns = angular.copy($scope.reportViewColumns);
      var preferences = {
        json: $scope.preferences
      };
      Preference.save(prefereces);
    };

    $scope.btnName = 'Refresh';
    function getList() {
      var params = {};
      angular.extend(params, $scope.query, pageStatus);
      delete params.__tk;
      $scope.promise = Conversion.get(params, function (result) {
        $scope.report = result.data;
        $scope.disabled = false;
        $scope.btnName = 'Refresh';
        $scope.applyBtn = false;

      }).$promise;
    }
    $scope.$watch('groupBy + datetype + fromDate + fromTime + toDate + toTime + activeStatus ', function(newVal, oldVal) {
      if (newVal != oldVal) {
        $scope.applyBtn = true;
        $scope.btnName = 'apply';
      }
    }, true);
    $scope.isNeedCurrency = function(key) {
      return ['Cost', 'Revenue'].indexOf(key) > -1;
    };
    // getList();

    function getDateRange(value) {
      var fromDate = moment().format('YYYY-MM-DD');
      var toDate = moment().add(1, 'days').format('YYYY-MM-DD');
      switch (value) {
        case '2':
          fromDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
          toDate = moment().format('YYYY-MM-DD');
          break;
        case '3':
          fromDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
          break;
        case '4':
          fromDate = moment().subtract(13, 'days').format('YYYY-MM-DD');
          break;
        case '5':
          fromDate = moment().day(1).format('YYYY-MM-DD');
          break;
        case '6':
          fromDate = moment().day(-6).format('YYYY-MM-DD');
          toDate = moment().day(1).format('YYYY-MM-DD');
          break;
        case '7':
          fromDate = moment().startOf('month').format('YYYY-MM-DD');
          break;
        case '8':
          fromDate = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
          toDate = moment().startOf('month').format('YYYY-MM-DD');
          break;
      }
      if (value == '0') {
        pageStatus.from = moment($scope.fromDate).format('YYYY-MM-DD') + 'T' + $scope.fromTime;
        pageStatus.to = moment($scope.toDate).format('YYYY-MM-DD') + 'T' + $scope.toTime;
      } else {
        pageStatus.from = fromDate + 'T00:00';
        pageStatus.to = toDate + 'T00:00';
      }
    }
  }
})();
