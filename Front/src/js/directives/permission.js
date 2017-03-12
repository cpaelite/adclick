angular.module('app').factory('Permissions', ['$rootScope', function($rootScope) {
  return {
    hasPermission: function(permission) {
      var permissions = $rootScope.permissions;
      if (!permissions) {
        return false;
      }
      var arrayPermission = permission.split('.');
      if (!permissions[arrayPermission[0]]) {
        return false;
      }
      if (!permissions[arrayPermission[0]][arrayPermission[1]]) {
        return false;
      }
      return permissions[arrayPermission[0]][arrayPermission[1]][arrayPermission[2]] ? permissions[arrayPermission[0]][arrayPermission[1]][arrayPermission[2]] : false;
    }
  };
}]);

angular.module('app').directive('hasPermission', ['Permissions', function(Permissions) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var value = attrs.hasPermission;
      var permission = Permissions.hasPermission(value);
      if (permission)
        return;
      var operation = attrs.operation;
      if (operation== "show") {
        element.hide();
        return;
      }
      if (operation == "readonly") {
        angular.element(element).prop('readonly',true);
        return;
      }
    }
  }
}]);
