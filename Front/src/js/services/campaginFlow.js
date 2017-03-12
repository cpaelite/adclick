(function() {

  angular.module('app').factory('CampaginFlow', ['$rootScope', '$mdDialog', '$q', '$http', 'Flow', 'Lander', 'Offer', 'Condition', 'Country', campaginFlow]);

  function campaginFlow($rootScope, $mdDialog, $q, $http, Flow, Lander, Offer, Condition, Country) {
    return {
      initCampaginFlow: initCampaginFlow
    }
    
    function initCampaginFlow() {
    var $scope = $rootScope.$new();
    var flowId = ''; //$scope.$stateParams.id;
    var isDuplicate = false; //$scope.$stateParams.dup == '1';
    var fromCampaign = false; //$scope.$stateParams.frcpn == '1';

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

    var theFlow; $scope.prefix = '';
    $scope.checkNameParams = {
      type: 4
    };
    $scope.showContinue = false;
    if (flowId) {
      prms = Flow.get({id:flowId}, function(result) {
        theFlow = result.data;
        $scope.oldName = theFlow.name;
      }).$promise;
      initPromises.push(prms);
      if(!isDuplicate) {
        $scope.checkNameParams.id = flowId;
      }

    } else {
      var defaultRule = angular.copy(ruleSkel);
      defaultRule.name = 'Default paths';
      defaultRule.isDefault = true;
      $scope.showContinue = true;

      theFlow = {
        name: 'Global - ',
        country: 'ZZZ',
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

          } else if (field.type == 'chips' || field.type == 'input-select') {
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
          conditionMap[condition.id].fields.forEach(function(field) {
            if (!condition[field.name]) return;
            if (field.type == "async-select" || field.type == "async-chips") {
              field._v2n = condition['_'+field.name];
            }
          });
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

    $scope.$watch('onEdit', function (newVal, oldVal) {
      if (newVal != oldVal)
        $scope.showContinue = false;
    });

    // operation on flow
    $scope.editFlow = function() {
      $scope.onEdit = 'flow';
      $scope.curRule = null;
      $scope.curPath = null;
      $scope.isDeleted = false;
    };
    $scope.$watch('flow.country', function (newValue, oldValue) {
      var preStr = newValue ? newValue.display + ' - ' : 'Global - ';
      if(newValue) {
        $scope.flow.name = preStr + $scope.flow.name.substr($scope.prefix.length);
      }
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
      //newRule.name = 'Rule ' + $scope.flow.rules.length;
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
      //newPath.name = 'Path ' + ($scope.curRule.paths.length + 1);
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
    $scope.restore = function(type, item) {
      var isCurrent = !item;
      if (type == 'rule') {
        item = item || $scope.curRule;
        item.unexpanded = false;
      } else if (type == 'path') {
        item = item || $scope.curPath;
      }
      item.isDeleted = false;
      if (isCurrent)
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

    // var validPattern = /^[- \w]*$/;
    // $scope.validateName = function(item) {
    //   item._nameError = !validPattern.test(item.name);
    // };
    //
    // $scope.validateCallback = function(isValid) {
    //   $scope.editFlowForm.name.$setValidity('asyncCheckName', isValid);
    // };
    //
    // $scope.postValidateCallback = function() {
    //   return $scope.flow.name.length == $scope.prefix.length;
    // };
    // function nameRequired() {
    //   if ($scope.prefix.length == $scope.flow.name.length) {
    //     $scope.editFlowForm.name.$setValidity('nameRequired', false);
    //   } else {
    //     $scope.editFlowForm.name.$setValidity('nameRequired', true);
    //   }
    // };
    //
    // $scope.nameRequired = nameRequired;
    //
    // $scope.nameChanged = function(flow) {
    //   var name = flow.name;
    //   var prefix = $scope.prefix;
    //   flow._nameError = !validPattern.test(name);
    //   if(name == undefined || name.length < prefix.length) {
    //     $scope.flow.name = prefix;
    //   } else if(name.indexOf(prefix) != 0) {
    //     var sub = name.substr(0, prefix.length);
    //     var arr1 = prefix.split('');
    //     var arr2 = sub.split('');
    //     var inputText = '';
    //     for(var i = 0, l = prefix.length; i < l; i++) {
    //       if(arr1[i] !== arr2[i]) {
    //         inputText = arr2[i];
    //         break;
    //       }
    //     }
    //     if(name.length < $scope.oldName.length) {
    //       $scope.flow.name = $scope.oldName.substr(0, $scope.oldName.length - 1);
    //     } else {
    //       $scope.flow.name = $scope.oldName + inputText;
    //     }
    //   }
    //   $scope.oldName = $scope.flow.name;
    //   nameRequired();
    // };

    // $scope.countryChanged = function() {
    //   console.log(123);
    // };

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
        var filtered = allLanders.filter(function(lander) {
          return theFlow.country.value == 'ZZZ' || lander.country == 'ZZZ' || lander.country == theFlow.country.value;
        }).filter(excludeIn($scope.curPath.landers.map(function(item) { return item._def; })));
        return query ? filtered.filter(createFilterFor(query, "name")) : filtered;
      } else {
        return [];
      }
    };
    $scope.$watch(function() {
      if ($scope.curPath == null) return [];
      return $scope.curPath.landers.map(function(item) {
        return item._def ? item.weight | 0 : -1;
      });
    }, function(newVal, oldVal) {
      if (!angular.equals(newVal, oldVal) && $scope.curPath != null) {
        calculateRelativeWeight($scope.curPath.landers, function(item) { return !!item._def; });
      }
    }, true);
    $scope.editLander = function(evt, lander) {
      var locals = { perfType: 'lander' };
      if (lander) {
        locals.item = {data: {landerId: lander._def.id}};
      } else {
        locals.item = null;
      }
      $mdDialog.show({
        clickOutsideToClose: false,
        controller: 'editLanderCtrl',
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: locals,
        bindToController: true,
        targetEvent: evt,
        templateUrl: 'tpl/lander-edit-dialog.html'
      }).then(function(result) {
        var newLander = {id: result.data.id, name: result.data.name, country: result.data.country};
        allLanders.unshift(newLander);
        if (lander) {
          var idx = allLanders.indexOf(lander._def);
          if (idx >= 0) {
            allLanders.splice(idx, 1);
          }
          lander._def = newLander;
        } else {
          $scope.curPath.landers.push({
            weight: 100,
            relativeWeight: -1,
            _def: newLander,
            _onEdit: true
          });
        }
      });
    };

    // operations on path offer
    $scope.addOffer = function(evt) {
      $scope.curPath.offers.push({
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
        var filtered = allOffers.filter(function(offer) {
          return theFlow.country.value == 'ZZZ' || offer.country == 'ZZZ' || offer.country == theFlow.country.value;
        }).filter(excludeIn($scope.curPath.offers.map(function(item) { return item._def; })));
        return query ? filtered.filter(createFilterFor(query, "name")) : filtered;
      } else {
        return [];
      }
    };
    $scope.$watch(function() {
      if ($scope.curPath == null) return [];
      return $scope.curPath.offers.map(function(item) {
        return item._def ? item.weight | 0 : -1;
      });
    }, function(newVal, oldVal) {
      if (!angular.equals(newVal, oldVal) && $scope.curPath != null) {
        calculateRelativeWeight($scope.curPath.offers, function(item) { return !!item._def; });
      }
    }, true);
    $scope.editOffer = function(evt, offer) {
      var locals = { perfType: 'offer' };
      if (offer) {
        locals.item = {data: {offerId: offer._def.id}};
      } else {
        locals.item = null;
      }
      $mdDialog.show({
        clickOutsideToClose: false,
        controller: 'editOfferCtrl',
        controllerAs: 'ctrl',
        focusOnOpen: false,
        locals: locals,
        bindToController: true,
        targetEvent: evt,
        templateUrl: 'tpl/offer-edit-dialog.html'
      }).then(function(result) {
        var newOffer = {id: result.data.id, name: result.data.name, country: result.data.country};
        allOffers.unshift(newOffer);
        if (offer) {
          var idx = allOffers.indexOf(offer._def);
          if (idx >= 0) {
            allOffers.splice(idx, 1);
          }
          offer._def = newOffer;
        } else {
          $scope.curPath.offers.push({
            weight: 100,
            relativeWeight: -1,
            _def: newOffer,
            _onEdit: true
          });
        }
      });
    };

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
      var arrTypes = ['chips', 'checkbox', 'l2select', 'async-chips'];
      condition.fields.forEach(function(f) {
        if (arrTypes.indexOf(f.type) >= 0) {
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
    $scope.querySearchSync = function(query, options, selected) {
      var matched = query ? options.filter(createFilterFor(query, "display")) : options;
      return matched.map(function(item) { return item.value; }).filter(excludeIn(selected));
    };
    $scope.querySearchAsync = function(query, f, selected) {
      return $http.get(f.url, {params: { q: query }}).then(function(response) {
        if (!f._v2n) f._v2n = {};
        var result = [];
        response.data.forEach(function(item) {
          f._v2n[item.value] = item.display;
          result.push(item.value);
        });
        return result.filter(excludeIn(selected));
      });
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
    $scope.saveErrors = [];
    $scope.save = function() {
      $scope.saveErrors.length = 0;
      $scope.showErrors = false;
      nameRequired();

      // clean up before save
      var flowData = {
        name: theFlow.name,
        country: theFlow.country ? theFlow.country.value : 'ZZZ',
        redirectMode: theFlow.redirectMode | 0,
        rules: []
      };
      if (theFlow.id) {
        flowData.id = theFlow.id;
      }

      if($scope.editFlowForm.name.$error.asyncCheckName) {
        $scope.saveErrors.push('Name already exists.');
      }

      if($scope.editFlowForm.name.$error.nameRequired) {
        $scope.saveErrors.push('Flow name ' + theFlow.name + ' already exists.');
      }

      if (theFlow._nameError) {
        $scope.saveErrors.push('Flow name ' + theFlow.name + ' is invalid');
      }

      $scope.saveTime = null;
      theFlow.rules.forEach(function(rule) {
        if (rule.isDeleted) {
          return;
        }
        if (rule._nameError) {
          $scope.saveErrors.push('Rule name ' + rule.name + ' is invalid');
        }
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
        if (!rule.isDefault && ruleData.conditions.length == 0) {
          $scope.saveErrors.push('Rule ' + rule.name + ' must contain at least 1 condition');
        }

        if (ruleData.isDefault) {
          delete ruleData.name;
          delete ruleData.enabled;
          delete ruleData.conditions;
        } else if (ruleData.conditions.length == 0) {
          delete ruleData.conditions;
        }

        rule.paths.forEach(function(path) {
          if (path.isDeleted) {
            return;
          }
          if (path._nameError) {
            $scope.saveErrors.push('Path name ' + path.name + ' is invalid');
          }
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
              if (lander._def)
                pathData.landers.push({id: lander._def.id, weight: lander.weight});
            });
            if (pathData.landers.length == 0) {
              delete pathData.landers;
            }
          }

          if (path.offers) {
            path.offers.forEach(function(offer) {
              if (offer._def)
                pathData.offers.push({id: offer._def.id, weight: offer.weight});
            });
            if (pathData.offers.length == 0) {
              delete pathData.offers;
              $scope.saveErrors.push('Path ' + path.name + ' must contain at least 1 offer');
            }
          }

          ruleData.paths.push(pathData);
        });

        flowData.rules.push(ruleData);
      });
      $scope.editFlowForm.$setSubmitted();
      if ($scope.saveErrors.length > 0) {
        $scope.showErrors = true;
        return $q.reject('error occurs');
      }

      $scope.onSave = true;
      return Flow.save(flowData, function(result) {
        $scope.onSave = false;
        $scope.saveTime = new Date();
        if (result.status != 1) {
          $scope.saveErrors.push(result.message);
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
        $scope.saveErrors.push('Network error when save flow');
      }).$promise;
    };

    $scope.close = function() {
      if (fromCampaign)
        $scope.$state.go('app.report.campaign');
      else
        $scope.$state.go('app.report.flow');
    };

    $scope.saveClose = function() {
      $scope.save().then(function() {
        if ($scope.saveErrors.length == 0)
          $scope.close();
      });
    };

    $scope.continueEdit = function() {
      var rule = theFlow.rules[0];
      $scope.editPath(rule, rule.paths[0]);
    };
  }
  }

})();
