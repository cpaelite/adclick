(function () {
  'use strict';

  angular.module('app')
    .controller('AutomatedRuleCtrl', [
      '$scope', '$timeout', '$mdDialog', 'toastr', 'Campaign',  AutomatedRuleCtrl
    ]);

  function AutomatedRuleCtrl($scope, $timeout, $mdDialog, toastr, Campaign) {

    $scope.editItem = function(item) {
      $mdDialog.show({
        clickOutsideToClose: true,
        escapeToClose: false,
        controller: ['$scope', '$mdDialog', editRuleCtrl],
        controllerAs: 'ctrl',
        focusOnOpen: false,
        bindToController: true,
        locals: {item: item},
        templateUrl: 'tpl/automatedRule-edit-dialog.html?' + +new Date()
      }).then(function() {

      });
    }

    function editRuleCtrl($scope, $mdDialog) {
      if (this.item) {
        this.title = "edit";
        $scope.campaigns = this.item.campaigns;
      } else {
        this.title = "add";
      }
      this.titleType = "Rule";

      $scope.countryFilter = {
        config: {
            plugins: ['remove_button'],
            valueField: 'value',
            labelField: 'display',
            searchField: ['display']
        },
        options: []
      };

      Campaign.get(null, function(result) {
        if (result.status) {
          $scope.countryFilter.options = result.data.campaign;
        }
      });

    }
    
  }
})();
