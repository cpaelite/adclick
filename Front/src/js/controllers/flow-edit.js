(function() {

  angular.module('app')
    .controller('FlowEditCtrl', [
        '$scope', '$mdDialog', '$timeout', 'Flow',
        FlowEditCtrl
    ]);

  function FlowEditCtrl($scope, $mdDialog, $timeout, Flow) {
    $scope.app.subtitle = 'Flow';
    var flowId = $scope.$stateParams.id;

    var pathSkel = {
      name: 'Path 1',
      enabled: true,
      weight: 100,
      relativeWeight: 100,
      redirect: '302',
      directLinking: false,
      landers: [],
      offers: [],
      isDeleted: false
    };
    var ruleSkel = {
      name: 'rule name',
      isDefault: false,
      enabled: true,
      conditions: [],
      paths: [ angular.copy(pathSkel) ],
      isDeleted: false
    };

    if (flowId) {
      Flow.get({id:flowId}, function(flow) {
        $scope.flow = flow;
      });

    } else {
      var defaultRule = angular.copy(ruleSkel);
      defaultRule.name = 'Default paths';
      defaultRule.isDefault = true;

      $scope.flow = {
        name: 'new flow',
        country: 'global',
        redirect: '302',
        rules: [ defaultRule ]
      };
    }

    function findIndex(arr, ele) {
      for (var i=0; i<arr.length; ++i) {
        if (arr[i] == ele) return i;
      }
      return -1;
    }

    function deleteElement(arr, ele) {
      var idx = findIndex(arr, ele);
      if (idx >= 0) {
        arr.splice(idx, 1);
        return true;
      } else {
        return false;
      }
    }

    function calculateRelativeWeight(obj) {
      var total = 0;
      obj.forEach(function(o) {
        if (!o.isDeleted)
          total += o.weight;
      });
      for (var i=0; i<obj.length; ++i) {
        if (!obj[i].isDeleted) {
          var rel = 100 * obj[i].weight / total;
          obj[i].relativeWeight = rel;
        }
      }
    }

    $scope.onEdit = 'flow';
    $scope.isDeleted = false;
    $scope.curRule = null;
    $scope.curPath = null;

    // operation on flow
    $scope.editFlow = function() {
      $scope.onEdit = 'flow';
      $scope.curRule = null;
      $scope.curPath = null;
      $scope.isDeleted = false;
    };
    $scope.$watch('flow.country', function (newValue, oldValue) {
      // todo: update flow name
      //$scope.flow.name = $scope.flow.country + ' - ' + $scope.flow.name;
    });

    // operation on rule
    $scope.editRule = function(rule) {
      if (rule.isDefault) return;
      $scope.onEdit = 'rule';
      $scope.isDeleted = rule.isDeleted;
      $scope.curRule = rule;
      $scope.curPath = null;
    };
    $scope.addRule = function() {
      var newRule = angular.copy(ruleSkel);
      newRule.name = 'Rule ' + $scope.flow.rules.length;
      $scope.flow.rules.push(newRule);
    };
    $scope.deleteRule = function() {
      $scope.isDeleted = true;
      $scope.curRule.isDeleted = true;
    };
    $scope.duplicateRule = function() {
      var newRule = angular.copy($scope.curRule);
      newRule.name = 'Rule ' + $scope.flow.rules.length;
      $scope.flow.rules.push(newRule);
    };
    $scope.toggleExpand = function(rule) {
      rule.unexpanded = !rule.unexpanded;
    };

    // operation on path
    $scope.editPath = function(rule, path) {
      $scope.onEdit = 'path';
      $scope.isDeleted = path.isDeleted;
      $scope.curRule = rule;
      $scope.curPath = path;
    };
    $scope.addPath = function(rule) {
      var newPath = angular.copy(pathSkel);
      newPath.name = 'Path ' + (rule.paths.length + 1);
      rule.paths.push(newPath);
      calculateRelativeWeight(rule.paths);
    };
    $scope.deletePath = function() {
      $scope.isDeleted = true;
      $scope.curPath.isDeleted = true;
      calculateRelativeWeight($scope.curRule.paths);
    };
    $scope.duplicatePath = function() {
      var newPath = angular.copy($scope.curPath);
      newPath.name = 'Path ' + ($scope.curRule.paths.length + 1);
      $scope.curRule.paths.push(newPath);
      //$scope.curPath = newPath;
      calculateRelativeWeight($scope.curRule.paths);
    };
    $scope.$watch($scope.curPath && $scope.curPath.weight, function(newVal, oldVal) {
      if (newVal != oldVal && $scope.curPath)
        calculateRelativeWeight($scope.curRule.paths);
    });

    $scope.restore = function() {
      if ($scope.onEdit == 'rule') {
        $scope.curRule.isDeleted = false;
      } else if ($scope.onEdit == 'path') {
        $scope.curPath.isDeleted = false;
      }
      $scope.isDeleted = false;
    };

    $scope.landerEditIsShow = false;
    $scope.landerEditClick = function(){
      $scope.landerEditIsShow = !$scope.landerEditIsShow;
    };
    $scope.offerEditIsShow = false;
    $scope.offerEditClick = function(){
      $scope.offerEditIsShow = !$scope.offerEditIsShow;
    }

    $scope.addLander = function() {
      $scope.curPath.landers.push({
        id: 0,
        name: '',
        weight: 100
      });
      //calculateRelativeWeight($scope.curPath.landers);
    };
    $scope.deleteLander = function(lander) {
      var idx;
      // todo: use findIndex, if available
      $scope.curPath.landers.forEach(function(ele, i) {
        if (ele == lander) {
          idx = i;
        }
      });
      if (idx !== undefined) {
        $scope.curPath.landers.splice(idx, 1);
      }
    };
    $scope.$watch($scope.curPath && $scope.curPath.landers, function(newVal, oldVal) {
      if (newVal != oldVal && $scope.curPath)
        calculateRelativeWeight($scope.curPath.landers);
    }, true);

    // operation on conditions
    var wdays = {
      mon: 'Monday',
      tue: 'Canada',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
      sun: 'Sunday'
    };
    var oses = {
      win: 'Windows',
      linux: 'Linux',
      android: 'Android',
      mac: 'Mac'
    };
    $scope.countries = {
      us: 'American',
      ca: 'Canada',
      cn: 'China',
      jp: 'Japen',
      hk: 'Hongkong'
    };
    $scope.availableConditions = [
      { id: 1, name: 'Day of week', multiple: true, values: wdays },
      { id: 2, name: 'Country', multiple: false, values: $scope.countries },
      { id: 3, name: 'OS', multiple: false, values: oses }
    ];

    $scope.addCondition = function(cond) {
      $scope.curRule.conditions.unshift({
        cid: cond.id,
        cdtn: cond,
        operand: 'is',
        value: ''
      });
    };
    $scope.deleteCondition = function(cond) {
      var idx;
      $scope.curRule.conditions.forEach(function(ele, i) {
        if (ele == cond) {
          idx = i;
        }
      });
      if (idx !== undefined) {
        $scope.curRule.conditions.splice(idx, 1);
      }
    };

    $scope.deleteAllConditions = function() {
      $scope.curRule.conditions = [];
    };

    function success(items) {
      $scope.items = items;
    }
    $scope.getList = function () {
      $scope.promise = Flow.get($scope.query, success).$promise;
    };
  }
})();
