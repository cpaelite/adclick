(function() {
    angular.module('app').controller('ConversionCtrl', ['$scope', '$mdDialog', 'Conversion', 'Preference', 'columnDefinition', ConversionCtrl]);
    function ConversionCtrl($scope, $mdDialog, Conversion, Preference, columnDefinition) {
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
            order: 'PostbackTimestamp',
            tz: newVal.reportTimeZone
          });

          unwatch();
          unwatch = null;
        }, true);

        $scope.applySearch = function() {
          getDateRange($scope.datetype);
          $scope.query.page = 1;
          $scope.query.__tk += 1;
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
        $scope.viewColumnClick = function () {
          $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
        };
        $scope.applyChange = function () {
          $scope.viewColumnIsShow = !$scope.viewColumnIsShow;
          $scope.preferences.reportViewColumns = angular.copy($scope.reportViewColumns);
          var preferences = {
            json: $scope.preferences
          };
          Preference.save(preferences);
        };

        function getList() {
          var params = {};
          angular.extend(params, $scope.query, pageStatus);
          delete params.__tk;
          Conversion.get(params, function(result) {
            $scope.report = result.data;
          });
        }

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
