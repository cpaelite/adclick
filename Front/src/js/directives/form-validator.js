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

angular.module('app').directive('myText', ['$rootScope', function ($rootScope) {
  return {
    link: function (scope, element) {
      $rootScope.$on('add', function (e, val, attriName) {
        var domElement = element[0];
        var url;
        if (domElement.selectionStart || domElement.selectionStart === 0) {
          var startPos = domElement.selectionStart;
          var endPos = domElement.selectionEnd;
          var scrollTop = domElement.scrollTop;
          if (domElement.value.indexOf(val) == -1) {
            //scope.item[attriName] = domElement.value.substring(0, startPos) + val + domElement.value.substring(endPos, domElement.value.length);
            url = domElement.value.substring(0, startPos) + val + domElement.value.substring(endPos, domElement.value.length);
            domElement.selectionStart = startPos + val.length;
            domElement.selectionEnd = startPos + val.length;
            domElement.scrollTop = scrollTop;
          }
          domElement.focus();
        } else {
          //scope.item[attriName] += val;
          url += val;
          domElement.focus();
        }
        scope.item[attriName] = url;
      });
    }
  }
}]);

angular.module('app').factory('UrlValidate', ['AppConstant', function(AppConstant) {
  return {
    addHttp: function(url) {
      if (url && url.indexOf('http://') == -1 && url.indexOf('https://') == -1) {
        url = "http://" + url;
      }
      return url;
    },
    validate: function(url) {
      var isValid = true;
      if (!url) {
        return isValid;
      }
      var strRegex = AppConstant.URLREG;
      var re=new RegExp(strRegex, 'g');
      if (!re.test(url)) {
        isValid = false;
      }
      return isValid;
    }
  }
}])
