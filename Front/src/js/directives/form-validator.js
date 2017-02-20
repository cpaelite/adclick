angular.module('app')
.directive('equalto', function() {
  return {
    restrict: 'A',
    require: "ngModel",
    scope: {
      equalto: '='
    },
    link: function(scope, element, attrs, ctrl) {
      ctrl.$validators.equalto = function(modelValue, viewValue) {
        return modelValue === scope.equalto;
      };

      scope.$watch('equalto', function() {
        ctrl.$validate();
      });
    }
  };
})

.directive('asyncCheckName', ['$q', '$http', function($q, $http) {
  return {
    restrict: 'A',
    require: "ngModel",
    scope: {
      asyncValidatorCallback: '&',
      postValidaterCallback: '&',
      asyncCheckName: '='
    },
    link: function(scope, element, attrs, ctrl) {
      ctrl.$asyncValidators.asyncCheck = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue) || scope.postValidaterCallback()) {
          return $q.when();
        }
        var deferred = $q.defer();
        var params = scope.asyncCheckName;
        params.name = modelValue;
        $http.post('/api/names', params).then(function(response) {
          if (!response.data.data.exists) {
            scope.asyncValidatorCallback()(true);
          } else {
            scope.asyncValidatorCallback()(false);
          }
          deferred.resolve();
        }, function(response) {
            deferred.reject();
        });

        return deferred.promise;
      };
    }
  }
}])

.directive('asyncCheck', ['$q', '$http', function($q, $http) {
  return {
    restrict: 'A',
    require: "ngModel",
    link: function(scope, element, attrs, ctrl) {
      ctrl.$asyncValidators.asyncCheck = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty model valid
          return $q.when();
        }

        var deferred = $q.defer();
        var params = {
          type: attrs.asyncCheck,
          data: modelValue
        };
        $http.get('/async-check', {params:params}).then(function(response) {
          console.log("async validate result:", response.data);
          if (response.data.result == 1) {
            deferred.resolve();
          } else {
            deferred.reject();
          }
        }, function(response) {
          console.log("async validate failed:", response);
          deferred.reject();
        });

        return deferred.promise;
      };
    }
  };
}]);
