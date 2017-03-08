angular.module('app').factory('Permissions', ['$rootScope', function($rootScope) {
  return {
    hasPermission: function(permission) {
      var permissions = $rootScope.permissions;
      console.log(permission);
      return permissions['report'][permission].show;
    }
  };
}]);

angular.module('app').directive('hasPermission', ['Permissions', function(Permissions) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var value = attrs.hasPermission.trim();
      console.log(value);
      var permission = Permissions.hasPermission(value);
      console.log(permission);
      if (permission) {
        element.show();
      } else {
        element.hide();
      }
    }
  }
}]);
