angular.module('app').factory('Permissions', ['$rootScope', function($rootScope) {
  return {
    hasPermission: function(permission) {
      var permissions = $rootScope.permissions;
      var arrayPermission = permission.split('.');
      if (permissions[arrayPermission[0]][arrayPermission[1]]) {
        return permissions[arrayPermission[0]][arrayPermission[1]][arrayPermission[2]];
      } else {
        return false;
      }
    }
  };
}]);

angular.module('app').directive('hasPermission', ['Permissions', function(Permissions) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var value = attrs.hasPermission;
      var permission = Permissions.hasPermission(value);
      if (!permission) {
        element.hide();
        return;
      }
      var operation = attrs.operation;
      if (operation== "show") {
        element.show();
      } else if (operation == "readonly") {
        element.addClass('readonly: true')
      }
    }
  }
}]);
