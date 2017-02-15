(function() {

  angular.module('app')
    .controller('FlowEditCtrl', [
        '$scope', '$mdDialog', '$q', 'Flow', 'Lander', 'Offer', 'Condition', 'Country',
        FlowEditCtrl
    ]);

  function FlowEditCtrl($scope, $mdDialog, $q, Flow, Lander, Offer, Condition, Country) {
    $scope.app.subtitle = 'Flow';
    var flowId = $scope.$stateParams.id;
    var isDuplicate = $scope.$stateParams.dup == '1';

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
        theFlow = result.data;
      }).$promise;
      initPromises.push(prms);

    } else {
      var defaultRule = angular.copy(ruleSkel);
      defaultRule.name = 'Default paths';
      defaultRule.isDefault = true;

      theFlow = {
        name: 'new flow',
        country: 'global',
        redirectMode: '0',
        rules: [ defaultRule ]
      };
    }

    var allLanders;
    prms = Lander.query({columns:'id,name,country'}, function(result) {
      allLanders = result;
    }).$promise;
    initPromises.push(prms);

    var allOffers;
    prms = Offer.query({columns:'id,name,country'}, function(result) {
      allOffers = result;
    }).$promise;
    initPromises.push(prms);

    var allConditions;
    prms = Condition.query({}, function(result) {
      allConditions = result;
      $scope.allConditions = allConditions;
    }).$promise;
    initPromises.push(prms);

    var allCountries;
    prms = Country.query({}, function(result) {
      //console.log(result);
      allCountries = result;
    }).$promise;
    initPromises.push(prms);

    $scope.initState = 'init';
    function initSuccess() {
      var offerMap = {};
      allOffers.forEach(function(offer) {
        offerMap[offer.id] = offer;
      });
      var landerMap = {};
      allLanders.forEach(function(lander) {
        landerMap[lander.id] = lander;
      });
      var conditionMap = {};
      allConditions.forEach(function(condition) {
        conditionMap[condition.id] = condition;
        condition.fields.forEach(function(field) {
          if (field.type == 'l2select') {
            var val2name = {};
            field.options.forEach(function(opt) {
              val2name[opt.value] = opt.display;

              opt.suboptions.forEach(function(subopt) {
                val2name[subopt.value] = subopt.display;
              });
            });
            field._v2n = val2name;

          } else if (field.type == 'chips') {
            var val2name = {};
            field.options.forEach(function(opt) {
              val2name[opt.value] = opt.display;
            });
            field._v2n = val2name;
          }
        });
      });
      
      var country = theFlow.country;
      allCountries.forEach(function(ctry) {
        if (ctry.value == country) {
          theFlow.country = ctry;
        }
      });

      // fulfill flow with lander/offer/condition
      if (isDuplicate) {
        delete theFlow.id;
      }
      theFlow.rules.forEach(function(rule) {
        if (isDuplicate) {
          delete rule.id;
        }
        if (!Array.isArray(rule.conditions)) {
          rule.conditions = [];
        }
        rule.conditions.forEach(function(condition) {
          condition._def = conditionMap[condition.id];
        });

        if (!Array.isArray(rule.paths)) {
          rule.paths = [];
        }

        calculateRelativeWeight(rule.paths, function(item) { return !item.isDeleted; });
        rule.paths.forEach(function(path) {
          if (isDuplicate) {
            delete path.id;
          }
          if (!Array.isArray(path.landers)) {
            path.landers = [];
          }

          calculateRelativeWeight(path.landers, function(item) { return !item.isDeleted; });
          path.landers.forEach(function(lander) {
            lander._def = landerMap[lander.id];
          });

          if (!Array.isArray(path.offers)) {
            path.offers = [];
          }

          calculateRelativeWeight(path.offers, function(item) { return !item.isDeleted; });
          path.offers.forEach(function(offer) {
            offer._def = offerMap[offer.id];
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
    }, true);

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
    $scope.toggleExpand = function(rule) {
      if (!rule.isDeleted) {
        rule.unexpanded = !rule.unexpanded;
      }
    };
    function duplicateRule() {
      var newRule = angular.copy($scope.curRule);
      newRule.name = 'Rule ' + $scope.flow.rules.length;
      $scope.flow.rules.push(newRule);
      $scope.editRule(newRule);
    }

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
    function duplicatePath() {
      var newPath = angular.copy($scope.curPath);
      newPath.name = 'Path ' + ($scope.curRule.paths.length + 1);
      $scope.curRule.paths.push(newPath);
      $scope.editPath($scope.curRule, newPath);
    }

    $scope.deleteCurrent = function(type) {
      if (type == 'rule') {
        $scope.curRule.isDeleted = true;
        $scope.curRule.unexpanded = true;
      } else if (type == 'path') {
        $scope.curPath.isDeleted = true;
      }
      $scope.isDeleted = true;
    };
    $scope.duplicateCurrent = function(type) {
      if (type == 'rule') {
        duplicateRule();
      } else if (type == 'path') {
        duplicatePath();
      }
    };
    $scope.restore = function(type) {
      if (type == 'rule') {
        $scope.curRule.isDeleted = false;
        $scope.curRule.unexpanded = false;
      } else if (type == 'path') {
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
        return (item[property].toLowerCase().indexOf(lcQuery) >= 0);
      };
    }

    $scope.queryCountries = function(query) {
      if (allCountries) {
        return query ? allCountries.filter(createFilterFor(query, "display")) : allCountries;
      } else {
        return [];
      }
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
        var countryFiltered = allLanders.filter(function(lander) {
          return theFlow.country.value == 'global' || lander.country == theFlow.country.value ;
        });
        return query ? countryFiltered.filter(createFilterFor(query, "name")) : countryFiltered;
      } else {
        return [];
      }
    };
    $scope.selectedLanderChange = function(item, lander) {
      if (item) {
        lander.id = item.id;
        lander._def = item;
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
        var countryFiltered = allOffers.filter(function(offer) {
          return theFlow.country.value == 'global' || offer.country == theFlow.country.value ;
        });
        return query ? countryFiltered.filter(createFilterFor(query, "name")) : countryFiltered;
      } else {
        return [];
      }
    };
    $scope.selectedOfferChange = function(item, offer) {
      if (item) {
        offer.id = item.id;
        offer._def = item;
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
    $scope.stopEdit = function(item) {
      item._onEdit = false;
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
        operand: condition.operands[0].value
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
      var matched = query ? options.filter(createFilterFor(query, "display")) : options;
      return matched.map(function(item) { return item.value; }).filter(excludeIn(selected));
    };

    function excludeIn(list) {
      return function(item) {
        return list.indexOf(item) == -1;
      };
    }

    $scope.deleteAllConditions = function() {
      $scope.curRule.conditions = [];
    };

    function exists(item, list) {
      return list.indexOf(item) >= 0;
    }
    $scope.exists = exists;
    function toggle(item, list) {
      var idx = list.indexOf(item);
      if (idx >= 0) {
        list.splice(idx, 1);
      } else {
        list.push(item);
      }
    }
    $scope.toggle = toggle;

    function l2containAny(selected, options) {
      for (var i = 0; i < options.length; ++i) {
        if (selected.indexOf(options[i].value) >= 0) {
          return true;
        }
      }
      return false;
    }
    function l2containAll(selected, options) {
      for (var i = 0; i < options.length; ++i) {
        if (selected.indexOf(options[i].value) < 0) {
          return false;
        }
      }
      return true;
    }
    function l2removeAll(selected, options) {
      options.forEach(function(opt) {
        var idx = selected.indexOf(opt.value);
        if (idx >= 0) {
          selected.splice(idx, 1);
        }
      });
    }
    $scope.toggleL2select = function(cdt, option, fname) {
      cdt._l1selected = option;
      var selected = cdt[fname];
      if (!l2containAny(selected, option.suboptions)) {
        toggle(option.value, selected);
      }
    };
    $scope.l2allIsChecked = function(cdt, fname) {
      return exists(cdt._l1selected.value, cdt[fname]);
    };
    $scope.l2IsIndeterminate = function(cdt, fname) {
      return l2containAny(cdt[fname], cdt._l1selected.suboptions);
    };
    $scope.l2toggleAll = function(cdt, fname) {
      var option = cdt._l1selected;
      var selected = cdt[fname];
      l2removeAll(selected, option.suboptions);
      toggle(option.value, selected);
    };
    $scope.l2isChecked = function(value, cdt, fname) {
      var option = cdt._l1selected;
      var selected = cdt[fname];
      if (exists(value, selected)) {
        return true;
      } else if (exists(option.value, selected)) {
        return true;
      } else {
        return false;
      }
    };
    $scope.l2toggle = function(value, cdt, fname) {
      var option = cdt._l1selected;
      var selected = cdt[fname];
      var checked = exists(value, selected);
      if (exists(option.value, selected)) {
        toggle(option.value, selected);
        option.suboptions.forEach(function(opt) {
          if (opt.value != value) {
            selected.push(opt.value);
          }
        });
      } else {
        toggle(value, selected);
        if (!checked && l2containAll(selected, option.suboptions)) {
          selected.push(option.value);
          l2removeAll(selected, option.suboptions);
        }
      }
    };

    // save
    $scope.save = function() {
      // clean up before save
      var flowData = {
        name: theFlow.name,
        country: theFlow.country.value,
        redirectMode: theFlow.redirectMode | 0,
        rules: []
      };
      if (theFlow.id) {
        flowData.id = theFlow.id;
      }

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

        if (rule.conditions) {
          rule.conditions.forEach(function(condition) {
            conData = {};
            Object.keys(condition).forEach(function(key) {
              if (key.indexOf('_') != 0) {
                conData[key] = condition[key];
              }
            });
            ruleData.conditions.push(conData);
          });
        }

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
            id: path.id || null,
            name: path.name,
            enabled: path.enabled,
            weight: path.weight,
            redirectMode: path.redirectMode | 0,
            directLinking: path.directLinking,
            landers: [],
            offers: []
          };

          if (path.landers) {
            path.landers.forEach(function(lander) {
              if (lander.id !== null)
                pathData.landers.push({id: lander.id, weight: lander.weight});
            });
            if (pathData.landers.length == 0) {
              delete pathData.landers;
            }
          }

          if (path.offers) {
            path.offers.forEach(function(offer) {
              if (offer.id !== null)
                pathData.offers.push({id: offer.id, weight: offer.weight});
            });
            if (pathData.offers.length == 0) {
              delete pathData.offers;
            }
          }

          ruleData.paths.push(pathData);
        });

        flowData.rules.push(ruleData);
      });

      $scope.onSave = true;
      $scope.saveError = null;
      return Flow.save(flowData, function(result) {
        $scope.onSave = false;
        $scope.saveTime = new Date();
        if (result.status != 1) {
          $scope.saveError = result.message;
        } else if (!theFlow.id) {
          theFlow.id = result.data.id;
          result.data.rules.forEach(function (rule, ruleIndex) {
            theFlow.rules[ruleIndex].id = rule.id;
            rule.paths.forEach(function (path, pathIndex) {
              theFlow.rules[ruleIndex].paths[pathIndex].id = path.id;
            });
          });

        }
      }, function() {
        $scope.onSave = false;
        $scope.saveError = 'Network error when save flow';
      }).$promise;
    };

    $scope.close = function() {
      $scope.$state.go('app.report.flow');
    };

    $scope.saveClose = function() {
      $scope.save().then(function() {
        if (!$scope.saveError)
          $scope.close();
      });
    };
  }
})();
