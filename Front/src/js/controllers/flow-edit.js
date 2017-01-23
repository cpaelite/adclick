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
      redirectMode: '0',
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
        redirectMode: '0',
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
        condition.fields.forEach(function(field) {
          if (field.type == 'l2select') {
            var val2name = {};
            field.options.forEach(function(opt) {
              val2name[opt.value] = opt.display;

              opt.suboptions.forEach(function(subopt) {
                val2name[subopt.value] = subopt.display;
              });
            });
            if (!condition._fv2n) {
              condition._fv2n = {};
            }
            condition._fv2n[field.name] = val2name;
          }
        });
      });
      
      // fulfill flow with lander/offer/condition
      theFlow.rules.forEach(function(rule) {
        if (!Array.isArray(rule.conditions)) {
          rule.conditions = [];
        }
        rule.conditions.forEach(function(condition) {
          condition._def = allConditions[conditionMap[condition.id]];
        });

        if (!Array.isArray(rule.paths)) {
          rule.paths = [];
        }
        rule.paths.forEach(function(path) {
          if (!Array.isArray(path.landers)) {
            path.landers = [];
          }
          path.landers.forEach(function(lander) {
            lander.name = allLanders[landerMap[lander.id]].name;
          });

          if (!Array.isArray(path.offers)) {
            path.offers = [];
          }
          path.offers.forEach(function(offer) {
            offer.name = allOffers[offerMap[offer.id]].name;
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

    function deleteElement(list, item) {
      var idx = list.indexOf(item);
      if (idx >= 0) {
        list.splice(idx, 1);
        return true;
      } else {
        return false;
      }
    }

    function calculateRelativeWeight(list, isValid) {
      var total = 0;
      list.forEach(function(item) {
        if (isValid(item))
          total += item.weight | 0;
      });
      list.forEach(function(item) {
        if (isValid(item)) {
          item.relativeWeight = 100 * item.weight / total;
        } else {
          item.relativeWeight = -1;
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
      $scope.editRule(newRule);
    };
    $scope.deleteRule = function() {
      $scope.isDeleted = true;
      $scope.curRule.isDeleted = true;
    };
    $scope.duplicateRule = function() {
      var newRule = angular.copy($scope.curRule);
      newRule.name = 'Rule ' + $scope.flow.rules.length;
      $scope.flow.rules.push(newRule);
      $scope.editRule(newRule);
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
      $scope.editPath(rule, newPath);
    };
    $scope.deletePath = function() {
      $scope.isDeleted = true;
      $scope.curPath.isDeleted = true;
    };
    $scope.duplicatePath = function() {
      var newPath = angular.copy($scope.curPath);
      newPath.name = 'Path ' + ($scope.curRule.paths.length + 1);
      $scope.curRule.paths.push(newPath);
      $scope.editPath($scope.curRule, newPath);
    };

    $scope.restore = function() {
      if ($scope.onEdit == 'rule') {
        $scope.curRule.isDeleted = false;
      } else if ($scope.onEdit == 'path') {
        $scope.curPath.isDeleted = false;
      }
      $scope.isDeleted = false;
    };

    $scope.$watch(function() {
      if ($scope.curRule == null) return [];
      return $scope.curRule.paths.map(function(item) {
        return item.isDeleted ? -1 : item.weight | 0;
      });
    }, function(newVal, oldVal) {
      if (!angular.equals(newVal, oldVal) && $scope.curRule != null) {
        calculateRelativeWeight($scope.curRule.paths, function(item) { return !item.isDeleted; });
      }
    }, true);

    function createFilterFor(query, property) {
      var lcQuery = angular.lowercase(query);

      return function(item) {
        return (item[property].indexOf(lcQuery) >= 0);
      };
    }

    $scope.searchTextChange = function(text) {
      console.info('Text changed to ' + text);
    };


    /*
    // demo code for async load autocomplete options
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
    // operations on path lander
    $scope.addLander = function(evt) {
      $scope.curPath.landers.push({
        id: null,
        name: null,
        weight: 100,
        relativeWeight: -1,
        _onEdit: true
      });
      evt.stopPropagation();
    };
    $scope.deleteLander = function(lander) {
      var idx = $scope.curPath.landers.indexOf(lander);
      if (idx >= 0) {
        $scope.curPath.landers.splice(idx, 1);
      }
    };
    $scope.queryLanders = function(query) {
      if (allLanders) {
        return query ? allLanders.filter(createFilterFor(query, "name")) : allLanders;
      } else {
        return [];
      }
    };
    $scope.selectedLanderChange = function(item, lander) {
      if (item) {
        lander.id = item.id;
        lander.name = item.name;
      }
    };
    $scope.$watch(function() {
      if ($scope.curPath == null) return [];
      return $scope.curPath.landers.map(function(item) {
        return item.id == null ? -1 : item.weight | 0;
      });
    }, function(newVal, oldVal) {
      if (!angular.equals(newVal, oldVal) && $scope.curPath != null) {
        calculateRelativeWeight($scope.curPath.landers, function(item) { return item.id != null; });
      }
    }, true);

    // operations on path offer
    $scope.addOffer = function(evt) {
      $scope.curPath.offers.push({
        id: null,
        name: null,
        weight: 100,
        relativeWeight: -1,
        _onEdit: true
      });
      evt.stopPropagation();
    };
    $scope.deleteOffer = function(offer) {
      var idx = $scope.curPath.offers.indexOf(offer);
      if (idx >= 0) {
        $scope.curPath.offers.splice(idx, 1);
      }
    };
    $scope.queryOffers = function(query) {
      if (allOffers) {
        return query ? allOffers.filter(createFilterFor(query, "name")) : allOffers;
      } else {
        return [];
      }
    };
    $scope.selectedOfferChange = function(item, offer) {
      if (item) {
        offer.id = item.id;
        offer.name = item.name;
      }
    };
    $scope.$watch(function() {
      if ($scope.curPath == null) return [];
      return $scope.curPath.offers.map(function(item) {
        return item.id == null ? -1 : item.weight | 0;
      });
    }, function(newVal, oldVal) {
      if (!angular.equals(newVal, oldVal) && $scope.curPath != null) {
        calculateRelativeWeight($scope.curPath.offers, function(item) { return item.id != null; });
      }
    }, true);

    $scope.setEdit = function(evt, item) {
      item._onEdit = true;
      evt.stopPropagation();
    };
    $scope.clearOnEdit = function() {
      if ($scope.curPath == null) return;
      $scope.curPath.landers.forEach(function(lander) {
        lander._onEdit = false;
      });
      $scope.curPath.offers.forEach(function(offer) {
        offer._onEdit = false;
      });
    };

    // operations on rule condition
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
      var idx = $scope.curRule.conditions.indexOf(cond);
      if (idx >= 0) {
        $scope.curRule.conditions.splice(idx, 1);
      }
    };
    $scope.querySearchIn = function(query, options, selected) {
      //console.log("st:", query);
      var matched = query ? options.filter(createFilterFor(query, "display")) : options;
      return matched.filter(excludeIn(selected));
    };

    function excludeIn(list) {
      return function(item) {
        list.indexOf(item) == -1;
      };
    }

    $scope.deleteAllConditions = function() {
      $scope.curRule.conditions = [];
    };

    $scope.exists = function(item, list) {
      list.indexOf(item) >= 0;
    };
    $scope.toggle = function (item, list) {
      var idx = list.indexOf(item);
      if (idx >= 0) {
        list.splice(idx, 1);
      } else {
        list.push(item);
      }
    };
    $scope.toggleL2select = function(cdt, option, fname) {
      cdt._suboptions = option.suboptions;
      $scope.toggle(option.value, cdt[fname]);
    };

    // save
    $scope.save = function() {
      // clean up before save
      var flowData = {
        id: theFlow.id || null,
        name: theFlow.name,
        country: theFlow.country,
        redirectMode: theFlow.redirectMode | 0,
        rules: []
      };

      theFlow.rules.forEach(function(rule) {
        if (rule.isDeleted)
          return;
        var ruleData = {
          id: rule.id || null,
          name: rule.name,
          enabled: rule.enabled,
          isDefault: rule.isDefault,
          conditions: [],
          paths: [],
        };

        rule.conditions.forEach(function(condition) {
          conData = {};
          Object.keys(condition).forEach(function(key) {
            if (key.indexOf('_') != 0) {
              conData[key] = condition[key];
            }
          });
          ruleData.conditions.push(conData);
        });

        if (ruleData.isDefault) {
          delete ruleData.name;
          delete ruleData.enabled;
          delete ruleData.conditions;
        } else if (ruleData.conditions.length == 0) {
          delete ruleData.conditions;
        }

        rule.paths.forEach(function(path) {
          if (path.isDeleted)
            return;
          pathData = {
            name: path.name,
            enabled: path.enabled,
            weight: path.weight,
            redirectMode: path.redirectMode | 0,
            directLinking: path.directLinking,
            landers: [],
            offers: []
          };

          path.landers.forEach(function(lander) {
            if (lander.id !== null)
              pathData.landers.push({id: lander.id, weight: lander.weight});
          });
          if (pathData.landers.length == 0) {
            delete pathData.landers;
          }

          path.offers.forEach(function(offer) {
            if (offer.id !== null)
              pathData.offers.push({id: offer.id, weight: offer.weight});
          });
          if (pathData.offers.length == 0) {
            delete pathData.offers;
          }

          ruleData.paths.push(pathData);
        });

        flowData.rules.push(ruleData);
      });

      console.log(flowData);
      $scope.onSave = true;
      Flow.save(flowData, function() { $scope.onSave = false; });
    };
  }
})();
