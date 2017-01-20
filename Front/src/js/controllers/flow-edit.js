(function() {

  angular.module('app')
    .controller('FlowEditCtrl', [
        '$scope', '$mdDialog', '$q', 'Flow', 'Lander', 'Offer', 'Condition', 'Country',
        FlowEditCtrl
    ]);

  function FlowEditCtrl($scope, $mdDialog, $q, Flow, Lander, Offer, Condition, Country) {
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

    // init load data
    var initPromises = [],
        prms;

    var theFlow;
    if (flowId) {
      prms = Flow.get({id:flowId}, function(result) {
        theFlow = result;
      }).$promise;
      initPromises.push(prms);

    } else {
      var defaultRule = angular.copy(ruleSkel);
      defaultRule.name = 'Default paths';
      defaultRule.isDefault = true;

      theFlow = {
        name: 'new flow',
        country: 'glb',
        redirect: '302',
        rules: [ defaultRule ]
      };
    }

    var allLanders;
    prms = Lander.query({columns:'id,name'}, function(result) {
      allLanders = result;
    }).$promise;
    initPromises.push(prms);

    var allOffers;
    prms = Offer.query({columns:'id,name'}, function(result) {
      allOffers = result;
    }).$promise;
    initPromises.push(prms);

    var allConditions;
    prms = Condition.query({}, function(result) {
      allConditions = result;
      $scope.allConditions = allConditions;
    }).$promise;
    initPromises.push(prms);

    prms = Country.query({}, function(result) {
      //console.log(result);
      $scope.allCountries = result;
    }).$promise;
    initPromises.push(prms);

    $scope.initState = 'init';
    function initSuccess() {
      var offerMap = {};
      allOffers.forEach(function(offer, idx) {
        offerMap[offer.id] = idx;
      });
      var landerMap = {};
      allLanders.forEach(function(lander, idx) {
        landerMap[lander.id] = idx;
      });
      var conditionMap = {};
      allConditions.forEach(function(condition, idx) {
        conditionMap[condition.id] = idx;
        //console.log("id:", condition.id, ",display:", condition.display);
      });
      
      // fulfill flow with lander/offer/condition
      theFlow.rules.forEach(function(rule) {
        rule.conditions.forEach(function(condition) {
          condition._def = allConditions[conditionMap[condition.id]];
        });

        rule.paths.forEach(function(path) {
          path.landers.forEach(function(lander) {
            lander._def = allLanders[landerMap[lander.id]];
          });
          path.offers.forEach(function(offer) {
            offer._def = allOffers[offerMap[offer.id]];
          });
        });
      });

      $scope.flow = theFlow;
      $scope.initState = 'success';
    }
    function initError() {
      $scope.initState = 'error';
    }
    $q.all(initPromises).then(initSuccess, initError);
    // end init data

    function findIndex(list, item) {
      for (var i=0; i<list.length; ++i) {
        if (list[i] == item) return i;
      }
      return -1;
    }

    function deleteElement(list, item) {
      var idx = findIndex(list, item);
      if (idx >= 0) {
        list.splice(idx, 1);
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
      obj.forEach(function(item) {
        if (!item.isDeleted) {
          var rel = 100 * item.weight / total;
          item.relativeWeight = rel;
        }
      });
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
        calculateRelativeWeight($scope.flow.rules);
      } else if ($scope.onEdit == 'path') {
        $scope.curPath.isDeleted = false;
        calculateRelativeWeight($scope.curRule.paths);
      }
      $scope.isDeleted = false;
    };

    function createFilterFor(query, property) {
      var lcQuery = angular.lowercase(query);

      return function(item) {
        return (item[property].indexOf(lcQuery) >= 0);
      };
    }

    $scope.searchTextChange = function(text) {
      console.info('Text changed to ' + text);
    };

    $scope.selectedItemChange = function(item) {
      console.info('Item changed to', item);
    };


    // operation on path/landers
    /*
    var allLanders = null;
    var landersPromise = null;
    function getAllLanders() {
      console.log("get landers");
      return Lander.get({columns:'id,name'}, function(result) {
        allLanders = result.data;
        landersPromise = null;
      }).$promise;
    }
    $scope.queryLanders = function(query) {
      if (allLanders !== null) {
        return query ? allLanders.filter(createFilterFor(query)) : allLanders;
      } else if (!landersPromise) {
        landersPromise = getAllLanders();
      }
      return landersPromise.then(function(data) {
        return query ? allLanders.filter(createFilterFor(query)) : allLanders;
      });
    };
    */
    $scope.queryLanders = function(query) {
      if (allLanders) {
        return query ? allLanders.filter(createFilterFor(query, "name")) : allLanders;
      } else {
        return [];
      }
    };
    $scope.addLander = function() {
      // todo
      $scope.curPath.landers.push({
        id: 0,
        name: '',
        _def: null,
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

    $scope.addCondition = function(condition) {
      var newCond = {
        id: condition.id,
        _def: condition,
        operand: 'is'
      };
      condition.fields.forEach(function(f) {
        if (f.type == "chips" || f.type == "checkbox" || f.type == 'l2select') {
          newCond[f.name] = [];
        }
      });
      $scope.curRule.conditions.unshift(newCond);
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
    $scope.querySearchIn = function(query, options, selected) {
      console.log("st:", query);
      var matched = query ? options.filter(createFilterFor(query, "display")) : options;
      return matched.filter(excludeIn(selected));
    };

    function excludeIn(list) {
      return function(item) {
        return findIndex(list, item) == -1;
      };
    }

    $scope.deleteAllConditions = function() {
      $scope.curRule.conditions = [];
    };

    $scope.exists = function(item, list) {
      return findIndex(list, item) >= 0;
    };
    $scope.toggle = function (item, list) {
      var idx = findIndex(list, item);
      if (idx > -1) {
        list.splice(idx, 1);
      } else {
        list.push(item);
      }
    };
                                                                            };
    $scope.save = function() {
      // clean up flow data
      var flowCopy = angular.copy(theFlow);
      flowCopy.rules.forEach(function(rule) {
        rule.conditions.forEach(function(condition) {
          delete condition._def;
        });

        rule.paths.forEach(function(path) {
          path.landers.forEach(function(lander) {
            delete lander._def;
          });
          path.offers.forEach(function(offer) {
            delete offer._def;
          });
        });
      });
      console.log(flowCopy);
    };

    /*
    function success(items) {
      $scope.items = items;
    }
    $scope.getList = function () {
      $scope.promise = Flow.get($scope.query, success).$promise;
    };
    */
  }
})();
