(function() {

  angular.module('app')
    .controller('FlowEditCtrl', [
        '$scope', '$mdDialog', '$q', '$timeout', '$http', 'Flow', 'Lander', 'Offer', 'Condition', 'Country', '$rootScope', 'reportCache',
        FlowEditCtrl
    ]);

  function FlowEditCtrl($scope, $mdDialog, $q, $timeout, $http, Flow, Lander, Offer, Condition, Country, $rootScope, reportCache) {
    var flowId, isDuplicate, fromCampaign, theFlow, tempCountryName, oldCountryName, fromPath;
    $scope.flowMode = true;
    if($scope.$stateParams) {
      $scope.app.subtitle = 'Flow';
      flowId = $scope.$stateParams.id;
      isDuplicate = $scope.$stateParams.dup == '1';
      fromCampaign = $scope.$stateParams.frcpn == '1';
      initFlowEditCtrl();
    } else {
      flowId = '';
      isDuplicate = false;
      fromCampaign = false;
      $scope.flowMode = false;
      $scope.$on('targetPathIdChanged', function(event, oData) {
        fromPath = true;
        isDuplicate = !!oData.isDuplicate;
        flowId = oData.flowId;
        initFlowEditCtrl();
      });
      $scope.$on('targetPathCountryChanged', function(event, oData) {
        if(!theFlow) return;
        if(!$scope.flowDataSuccess) {
          theFlow.country = oData.country.value;
          return;
        }
        var oldCountry = angular.copy($scope.country);
        if(oData.value !== 'ZZZ' && checkLanderAndOfferStatus(theFlow.rules, {value: oData.country.value})) {
          $mdDialog.show({
            multiple: true,
            skipHide: true,
            escapeToClose: false,
            clickOutsideToClose: false,
            controller: ['$scope', '$mdDialog', confirmResetLanderAndOfferCtrl],
            controllerAs: 'ctrl',
            focusOnOpen: false,
            bindToController: true,
            templateUrl: 'tpl/delete-confirm-dialog.html?' + +new Date()
          }).then(function(result) {
            if(result.status) {
              theFlow.rules = checkLanderAndOffer(theFlow.rules, {value: oData.country.value})
              $scope.country = angular.copy(oData.country);
            } else {
              $scope.$emit('targetPathCountryReseted', {});
            }
          });
        } else {
          $scope.country = angular.copy(oData.country);
        }
      });
    }

    $scope.$on('saveCampaignEnd', function(event, oData) {
      var flow = oData.flow;
      var copyFlow = angular.copy($scope.flow);
      if(!flow) return;
      copyFlow.id = flow.id;
      copyFlow.name = flow.name;
      if(!flow.rules) return;
      flow.rules.forEach(function(rule, i) {
        copyFlow.rules[i].id = rule.id;
        rule.paths.forEach(function(path, j) {
          copyFlow.rules[i].paths[j].id = path.id;
        });
      });
      $scope.flow = theFlow = copyFlow;
      $scope.curPath = theFlow.rules[0].paths[0];
      $scope.curRule = theFlow.rules[0];
    });

    function initFlowEditCtrl() {
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

      $scope.saveErrors = [];

      // init load data
      var initPromises = [],
      prms;

      $scope.prefix = '';
      $scope.checkNameParams = {
        type: 4
      };
      $scope.showContinue = false;
      $scope.editOffer = function(evt, offer, cacheOffer) {
        if(!reportCache.get('flow-cache')) {
          if ($scope.$parent.pathRoute) {
              $scope.$emit('pathCacheDataPedding');
          } else {
            var oData = handleData(false, true);
            var flowData = oData.flowData;
            flowData.onEdit = oData.onEdit;
            flowData.curRule = oData.curRule;
            flowData.curPath = oData.curPath;
            reportCache.put('flow-cache', flowData);
          }
        }
        var locals = { perfType: 'offer' };
        if(cacheOffer) {
          locals.cache = cacheOffer;
        } else if (offer) {
          locals.item = {data: {offerId: offer._def.id}};
        } else {
          locals.item = null;
        }
        locals.frcpn = $scope.$parent.pathRoute ? 1 : 2;
        locals.country = $scope.country;
        $mdDialog.show({
          multiple: true,
          skipHide: true,
          escapeToClose: false,
          clickOutsideToClose: false,
          controller: 'editOfferCtrl',
          controllerAs: 'ctrl',
          focusOnOpen: false,
          locals: locals,
          bindToController: true,
          targetEvent: evt,
          templateUrl: 'tpl/offer-edit-dialog.html?' + +new Date()
        }).then(function(result) {
          if ($scope.$parent.pathRoute) {
            $scope.$emit('pathCacheDataCancled');
          } else if(cacheOffer) {
            reportCache.remove('flow-cache');
            reportCache.remove('offer-cache');
          }
          if(!result) {
            return;
          }
          var newOffer = {id: result.data.id, name: result.data.name, country: result.data.country};
          // allOffers.unshift(newOffer);
          if (offer) {
            // var idx = allOffers.indexOf(offer._def);
            // if (idx >= 0) {
            //   allOffers.splice(idx, 1);
            // }
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
      if(reportCache.get('flow-cache')) {
        theFlow = angular.copy(reportCache.get('flow-cache'));
        // reportCache.remove('flow-cache')
        $scope.oldName = theFlow.name;
        $scope.onEdit = theFlow.onEdit;

        theFlow.rules.some(function(rule) {
          if(rule.name == theFlow.curRule.name) {
            $scope.curRule = rule;
            rule.paths.some(function(path) {
              if(path.name == theFlow.curPath.name) {
                $scope.curPath = path;
                return true;
              } else {
                return false;
              }
            });
          } else {
            return false;
          }
        });
        if(reportCache.get('offer-cache')) {
          $scope.editOffer(null, null, reportCache.get('offer-cache'));
          reportCache.remove('offer-cache');
        }
      } else if($scope.$parent.renderCampaignCachePathData) {
        theFlow = angular.copy($scope.$parent.renderCampaignCachePathData);
        $scope.onEdit = theFlow.onEdit;
        theFlow.rules.some(function(rule) {
          if(rule.name == theFlow.curRule.name) {
            $scope.curRule = rule;
            rule.paths.some(function(path) {
              if(path.name == theFlow.curPath.name) {
                $scope.curPath = path;
                return true;
              } else {
                return false;
              }
            });
          } else {
            return false;
          }
        });
        if(reportCache.get('offer-cache')) {
          $scope.editOffer(null, null, reportCache.get('offer-cache'));
          reportCache.remove('offer-cache');
        }
        $scope.$parent.renderCampaignCachePathData = null;
      } else if (flowId) {
        prms = Flow.get({id:flowId}, function(result) {
          theFlow = result.data;
          if(fromPath) {
            $scope.curPath = theFlow.rules[0].paths[0];
            $scope.curRule = theFlow.rules[0];
          }
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

        if(fromPath) {
          $scope.curPath = theFlow.rules[0].paths[0];
          $scope.curRule = theFlow.rules[0];
        }

        $scope.prefix = $scope.oldName = 'Global - ';
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
      if(!$rootScope.allConditions) {
        prms = Condition.query({}, function(result) {
          allConditions = result;
          $rootScope.allConditions = $scope.allConditions = allConditions;
        }).$promise;
        initPromises.push(prms);
      } else {
        allConditions = $rootScope.allConditions;
        $scope.allConditions = $rootScope.allConditions;
      }

      var allCountries;
      prms = Country.query({}, function(result) {
        allCountries = result;
      }).$promise;
      initPromises.push(prms);

      $scope.initState = 'init';
      function initSuccess() {
        $scope.flowDataSuccess = true;
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
            $scope.country = ctry;
            $scope.prefix = ctry.display + ' - ';
          }
        });

        oldCountryName = tempCountryName = angular.copy($scope.country);

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
                if(field._v2n) {
                  for (var key in condition['_'+field.name]) {
                    field._v2n[key] = condition['_'+field.name][key];
                  }
                } else {
                  field._v2n = condition['_'+field.name];
                }
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
            })
            /*path.offers.forEach(function(offer) {
              offer._def = {
                id: offer.id,
                name: offer.name
              };
            });*/
          });
        });

        $scope.flow = theFlow;
        // if(!$scope.flowMode && fromCampaign) {
        //   $scope.editPath($scope.flow.rules[0], $scope.flow.rules[0].paths[0]);
        // }
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

      $scope.onEdit = $scope.onEdit ? $scope.onEdit : ($scope.flowMode ? 'flow' : 'path');
      $scope.isDeleted = false;
      $scope.curRule = $scope.curRule ? $scope.curRule : null;
      $scope.curPath = $scope.curPath ? $scope.curPath : null;

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
      $scope.$watch('country', function (newValue, oldValue) {
        var preStr = newValue ? newValue.display + ' - ' : 'Global - ';
        if(newValue) {
          $scope.flow.name = $scope.flow.name ? $scope.flow.name : '';
          $scope.flow.name = preStr + $scope.flow.name.substr($scope.prefix.length);
          $scope.oldName = preStr + ($scope.oldName ? $scope.oldName.substr($scope.prefix.length) : $scope.flow.name.substr($scope.prefix.length));
          $scope.prefix = preStr;
        }
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
      $scope.toggleExpand = function(rule) {
        if (!rule.isDeleted) {
          rule.unexpanded = !rule.unexpanded;
        }
      };
      function duplicateRule() {
        var newRule = angular.copy($scope.curRule);
        //newRule.name = 'Rule ' + $scope.flow.rules.length;
        delete newRule.id;
        newRule.paths.forEach(function(path) {
          delete path.id;
        });
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
        delete newPath.id;
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
        return $scope.curRule.paths && $scope.curRule.paths.map(function(item) {
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

      var validPattern = /^[- \w]*$/;
      $scope.validateName = function(item) {
        item._nameError = !validPattern.test(item.name);
      };

      $scope.validateCallback = function(isValid) {
        if(!$scope.flowMode) return;
        $scope.editFlowForm.name.$setValidity('asyncCheckName', isValid);
      };

      $scope.postValidateCallback = function() {
        return $scope.flow.name.length == $scope.prefix.length;
      };
      function nameRequired() {
        if ($scope.prefix.length == $scope.flow.name.length) {
          $scope.editFlowForm.name.$setValidity('nameRequired', false);
        } else {
          $scope.editFlowForm.name.$setValidity('nameRequired', true);
        }
      };

      $scope.nameRequired = nameRequired;

      $scope.nameChanged = function(flow) {
        var name = flow.name;
        var prefix = $scope.prefix;
        flow._nameError = !validPattern.test(name);
        if(name == undefined || name.length < prefix.length) {
          $scope.flow.name = prefix;
        } else if(name.indexOf(prefix) != 0) {
          var sub = name.substr(0, prefix.length);
          var arr1 = prefix.split('');
          var arr2 = sub.split('');
          var inputText = '';
          for(var i = 0, l = prefix.length; i < l; i++) {
            if(arr1[i] !== arr2[i]) {
              inputText = arr2[i];
              break;
            }
          }
          if(name.length < $scope.oldName.length) {
            $scope.flow.name = $scope.oldName.substr(0, $scope.oldName.length - 1);
          } else {
            $scope.flow.name = $scope.oldName + inputText;
          }
        }
        $scope.oldName = $scope.flow.name;
        nameRequired();
      };

      $scope.countryChanged = function(country) {
        if(!country) {return;}
        oldCountryName = angular.copy(tempCountryName);
        tempCountryName = angular.copy(country);
        if(country.value != 'ZZZ') {
          if(checkLanderAndOfferStatus(theFlow.rules, country)) {
            $mdDialog.show({
              multiple: true,
              skipHide: true,
              escapeToClose: false,
              clickOutsideToClose: false,
              controller: ['$scope', '$mdDialog', confirmResetLanderAndOfferCtrl],
              controllerAs: 'ctrl',
              focusOnOpen: false,
              locals: {oldCountryName: oldCountryName},
              bindToController: true,
              templateUrl: 'tpl/delete-confirm-dialog.html?' + +new Date()
            }).then(function(result) {
              if(reportCache.get('flow-cache')) {
                reportCache.remove('flow-cache');
              }
              if(result.status) {
                theFlow.rules = checkLanderAndOffer(theFlow.rules, country)
              } else {
                if(result.oldCountryName.value == $scope.country.value) {
                  $scope.country = {value: 'ZZZ', display: 'Global'};
                } else {
                  $scope.country = result.oldCountryName;
                }
              }
            });
          }
        }
      };

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
        var deferred = $q.defer();
        $timeout(function() {
          if (allLanders) {
            var filtered = allLanders.filter(function(lander) {
              return $scope.country.value == 'ZZZ' || lander.country == 'ZZZ' || lander.country == $scope.country.value;
            }).filter(excludeInLander($scope.curPath.landers.map(function(item) { return item._def; })));
            deferred.resolve(query ? filtered.filter(createFilterFor(query, "name")) : filtered);
          } else {
            deferred.resolve([]);
          }
        });
        return deferred.promise;
      };
      function excludeInLander(list) {
        return function(item) {
          // return list.indexOf(item) == -1;
          return list.every(function(li) {
            return !li || (li && li.id != item.id)
          });
        };
      }
      $scope.$watch(function() {
        if ($scope.curPath == null) return [];
        return $scope.curPath.landers && $scope.curPath.landers.map(function(item) {
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
        locals.country = $scope.country;
        $mdDialog.show({
          multiple: true,
          skipHide: true,
          escapeToClose: false,
          clickOutsideToClose: false,
          controller: 'editLanderCtrl',
          controllerAs: 'ctrl',
          focusOnOpen: false,
          locals: locals,
          bindToController: true,
          targetEvent: evt,
          templateUrl: 'tpl/lander-edit-dialog.html?' + +new Date()
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
        // if(!query) return [];
        var selectedIds = ($scope.curPath.offers || []).filter(function(offer) {
          return offer._def;
        }).map(function(offer) {
          return offer._def.id;
        });
        return Offer.query({columns: 'id,name', country: ($scope.country && $scope.country.value) || 'ZZZ', ids: selectedIds.join(','), filter: query}, function(result) {
          return result;
        }).$promise
      };
      $scope.$watch(function() {
        if ($scope.curPath == null) return [];
        return $scope.curPath.offers && $scope.curPath.offers.map(function(item) {
          return item._def ? item.weight | 0 : -1;
        });
      }, function(newVal, oldVal) {
        if (!angular.equals(newVal, oldVal) && $scope.curPath != null) {
          calculateRelativeWeight($scope.curPath.offers, function(item) { return !!item._def; });
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
        var arrTypes = ['chips', 'checkbox', 'l2select', 'async-chips'];
        condition.fields.forEach(function(f) {
          if (arrTypes.indexOf(f.type) >= 0) {
            newCond[f.name] = [];
          }
        });
        $scope.curRule.conditions.unshift(newCond);
      };

      $scope.notInNewCondFilter = function(id) {
        var conditions = $scope.curRule.conditions;
        return !(conditions.some(function(condition) {
          return condition.id == id.id;
        }));
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

      /*
       * @name: handle data
       * @param: {bool} isFromCampaign: false(flow页面的数据)、true(campaign页面path的数据)
       */
      function handleData(isFromCampaign, isCacheData) {
        $scope.saveErrors.length = 0;
        $scope.showErrors = false;
        // clean up before save
        var flowData;
        if (isFromCampaign) {
          flowData = {
            rules: []
          };
        } else {
          flowData = {
            name: theFlow.name,
            country: $scope.country ? $scope.country.value : 'ZZZ',
            redirectMode: theFlow.redirectMode | 0,
            rules: []
          };
        }

        if(!isFromCampaign && !isCacheData) {
          nameRequired();
        }
        if(!isCacheData && !isFromCampaign) {
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
        }
        if (theFlow.id) {
          flowData.id = theFlow.id;
        }

        theFlow.rules.forEach(function(rule) {
          if (rule.isDeleted && !isCacheData) {
            return;
          }
          if (rule._nameError) {
            $scope.saveErrors.push('Rule name ' + rule.name + ' is invalid');
          }
          var ruleData = {
            name: rule.name,
            enabled: rule.enabled,
            isDefault: rule.isDefault,
            conditions: [],
            paths: [],
          };

          if(rule.id) {
            ruleData.id = rule.id;
          }
          if (rule.conditions) {
            rule.conditions.forEach(function(condition) {
              conData = {};
              Object.keys(condition).forEach(function(key) {
                if (key.indexOf('_') != 0) {
                  conData[key] = condition[key];
                }
              });
              condition._def.fields.forEach(function(field) {
                if(field.type == 'async-chips') {
                  conData['_'+field.name] = {};
                  conData[field.name].forEach(function(value) {
                    conData['_'+field.name][value] = field._v2n ? (field._v2n[value] ? field._v2n[value] : value) : value;
                  });
                }
              });
              ruleData.conditions.push(conData);
            });
          }
          if (!rule.isDefault && ruleData.conditions.length == 0) {
            $scope.saveErrors.push('Rule ' + rule.name + ' must contain at least 1 condition');
          } else if (!rule.isDefault && ruleData.conditions.length > 0) {
            var conditionStatus = ruleData.conditions.some(function(c) {
              return !(c.value && Object.prototype.toString.apply(c.value) == '[object String]' || c.value && Object.prototype.toString.apply(c.value) == '[object Array]' && c.value.length > 0
              || (c.weekday && c.weekday.length > 0 && c.tz) || (c.endtime != undefined && c.starttime != undefined && c.tz))
            });
            if(conditionStatus) {
              $scope.saveErrors.push('At least one value should be set for ' + rule.name  + "'s condition");
            }
          }
          if (ruleData.isDefault && !isCacheData) {
            delete ruleData.name;
            delete ruleData.enabled;
            delete ruleData.conditions;
          } else if (ruleData.conditions.length == 0) {
            delete ruleData.conditions;
          }
          rule.paths.forEach(function(path) {
            if (path.isDeleted && !isCacheData) {
              return;
            }
            if (path._nameError) {
              $scope.saveErrors.push('Path name ' + path.name + ' is invalid');
            }
            pathData = {
              name: path.name,
              enabled: path.enabled,
              weight: path.weight,
              redirectMode: path.redirectMode | 0,
              directLinking: path.directLinking,
              landers: [],
              offers: []
            };
            if(path.id) {
              pathData.id = path.id;
            }
            if(isCacheData) {
              pathData['isDeleted'] = path.isDeleted;
            }
            if (path.landers) {
              path.landers.forEach(function(lander) {
                if (lander._def)
                  pathData.landers.push({id: lander._def.id, weight: lander.weight});
              });
              if (pathData.landers.length == 0) {
                delete pathData.landers;
                if (!path.directLinking) {
                  $scope.saveErrors.push('Path ' + path.name + ' must contain at least 1 lander');
                }
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
          if(ruleData.paths.length == 0) {
            $scope.saveErrors.push('Rule ' + rule.name + ' must contain at least 1 path');
          }
          flowData.rules.push(ruleData);
        });

        var notAllPathDisabled = flowData.rules.some(function(rule) {
          return (rule.paths.some(function(path) {
            return path.enabled == true;
          }));
        });

        if(!notAllPathDisabled) {
          $scope.saveErrors.push('At least one path must be active.');
        }

        return {
          flowData: flowData,
          onEdit: $scope.onEdit,
          curRule: $scope.curRule,
          curPath: $scope.curPath
        };
      }

      // Flow save

      $scope.save = function() {
        var oData = handleData(false), flowData = oData.flowData;
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

      // 监听campaign save操作，获取数据
      $scope.$on('saveCampaignStarted', function() {
        var oData = handleData(true), flowData = oData.flowData;
        // $scope.editFlowForm.$setSubmitted();
        if ($scope.saveErrors.length > 0) {
          $scope.showErrors = true;
          $scope.$emit('pathDataSuccessed', {
            status: 0,
            message: angular.copy($scope.saveErrors)
          });
          return $q.reject('error occurs');
        }

        $scope.$emit('pathDataSuccessed', {
          status: 1,
          data: flowData
        });
      });

      // campaign cache data
      $scope.$on('cacheCampaignStarted', function() {
        var oData = handleData(true, true), flowData = oData.flowData;
        $scope.$emit('pathCacheDataSuccessed', {
          status: 1,
          data: flowData,
          onEdit: $scope.onEdit,
          curRule: $scope.curRule,
          curPath: $scope.curPath
        });
      });

      $scope.close = function() {
        if (fromCampaign) {
          $scope.$state.go('app.report.campaign');
        } else {
          $scope.$state.go('app.report.flow');
        }
        reportCache.remove('flow-cache');
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

      $scope.hideErrors = function() {
        $scope.showErrors = false;
      };
    }

    function confirmResetLanderAndOfferCtrl($scope, $mdDialog) {
      var self = this;
      this.title = '';
      this.content = 'changeCountryConfirm';

      this.ok = function() {
        $mdDialog.hide({
          status: true
        });
      };

      this.cancel = function() {
        $mdDialog.hide({
          status: false,
          oldCountryName: self.oldCountryName
        });
      };
    }

    function checkLanderAndOffer(rules, country) {
      rules.forEach(function(rule) {
        rule.paths.forEach(function(path) {
          if (path.landers) {
            path.landers.forEach(function(lander) {
              if (lander._def && lander._def.country != 'ZZZ' && lander._def.country != country.value) {
                lander._def = '';
                lander._searchText = '';
              }
            });
          }

          if (path.offers) {
            path.offers.forEach(function(offer) {
              if (offer._def && offer._def.country != 'ZZZ' && offer._def.country != country.value) {
                offer._def = '';
                offer._searchText = '';
              }
            });
          }
        });
      });
      return rules;
    }

    function checkLanderAndOfferStatus(rules, country) {
      var returnStatus = false;
      rules.forEach(function(rule) {
        rule.paths.forEach(function(path) {
          if (path.landers) {
            path.landers.some(function(lander) {
              if (lander._def && lander._def.country != 'ZZZ' && lander._def.country != country.value) {
                returnStatus = true;
                return false;
              }
            });
          }

          if (path.offers) {
            path.offers.some(function(offer) {
              if (offer._def && offer._def.country != 'ZZZ' && offer._def.country.indexOf(country.value) == -1) {
                returnStatus = true;
                return false;
              }
            });
          }
        });
      });
      return returnStatus;
    }
  }
})();
