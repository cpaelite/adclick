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

angular.module('app').directive('jsonText', function() {
  return {
    restrict: 'A', // only activate on element attribute
    require: 'ngModel', // get a hold of NgModelController
    link: function(scope, element, attrs, ngModelCtrl) {

      var lastValid;

      // push() if faster than unshift(), and avail. in IE8 and earlier (unshift isn't)
      ngModelCtrl.$parsers.push(fromUser);
      ngModelCtrl.$formatters.push(toUser);

      // clear any invalid changes on blur
      element.bind('blur', function() {
        element.val(toUser(scope.$eval(attrs.ngModel)));
      });

      // $watch(attrs.ngModel) wouldn't work if this directive created a new scope;
      // see http://stackoverflow.com/questions/14693052/watch-ngmodel-from-inside-directive-using-isolate-scope how to do it then
      scope.$watch(attrs.ngModel, function(newValue, oldValue) {
        lastValid = lastValid || newValue;

        if (newValue != oldValue) {
          ngModelCtrl.$setViewValue(toUser(newValue));

          // TODO avoid this causing the focus of the input to be lost..
          ngModelCtrl.$render();
        }
      }, true); // MUST use objectEquality (true) here, for some reason..

      function fromUser(text) {
        // Beware: trim() is not available in old browsers
        if (!text || text.trim() === '') {
          return {};
        } else {
          try {
            lastValid = angular.fromJson(text);
            ngModelCtrl.$setValidity('invalidJson', true);
          } catch (e) {
            ngModelCtrl.$setValidity('invalidJson', false);
          }
          return lastValid;
        }
      }

      function toUser(object) {
        // better than JSON.stringify(), because it formats + filters $$hashKey etc.
        return angular.toJson(object, true);
      }
    }
  };
});

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
      if (url.match(re) == null) {
        isValid = false;
      }
      return isValid;
    }
  }
}]);

angular.module('app').factory('EmailValidate', ['AppConstant', function(AppConstant) {
  return {
    validate: function(emails) {
      var isValid = true;
      if (!emails) {
        return isValid;
      }
      var strRegex = AppConstant.EMAILREG;
      var re = new RegExp(strRegex, 'g');
      var emailArr = emails.split(",");
      emailArr.forEach(function(email) {
        if (email.match(re) == null) {
          isValid = false;
          return;
        }
      });
      /*if (results.indexOf(false) != -1) {
        isValid = false;
      }*/
      return isValid;
    }
  }
}])
