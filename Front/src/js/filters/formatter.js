'use strict';

/* Filters */
angular.module('app')
  .filter('formatter', ['$filter', function($filter) {
    return function(input, type) {
        var params = [];
        if (angular.isArray(type)) {
            params = angular.copy(type);
            type = params.shift();
        }
        params.unshift(input);
        //console.log(type,params);

        var builtin = ['currency', 'date', 'number', 'json', 'lowercase', 'uppercase'];

        if (builtin.indexOf(type) >= 0) {
            return $filter(type).apply(null, params);
        } else if (type == "custom") {
            return "C: " + input;
        } else {
            return input;
        }
    }
  }])
 .filter('split', function() {
    return function(str, glue) {
        var glue = glue ? glue : ',';
        return str.toString().replace(/\B(?=(?:\d{3})+\b)/g, ',');
    }
  })
  .filter('currency', function() {
      return function(input, glue) {
        glue = glue ? glue : '$';
        input = input || 0;
        return glue + input; //.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      };
  })
  .filter('ucfirst', function() {
    return function(input) {
      return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
    }
  });
