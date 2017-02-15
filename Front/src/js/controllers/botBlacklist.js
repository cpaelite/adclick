(function () {
    'use strict';

    angular.module('app')
        .controller('BotBlacklistCtrl', [
            '$scope','$mdDialog', 'BlackList',
            BotBlacklistCtrl
        ]);

    function BotBlacklistCtrl($scope,$mdDialog, BlackList) {
      BlackList.get(null, function (blacklist) {
        $scope.items = blacklist.data.blacklist;
      });

      $scope.editItem = function(ev, item) {
        $mdDialog.show({
          targetEvent: ev,
          clickOutsideToClose: false,
          controllerAs: 'ctrl',
          controller: ['$scope', '$mdDialog', editItemCtrl],
          focusOnOpen: false,
          locals: {
            item: item
          },
          templateUrl: 'tpl/botBlacklist-edit-dialog.html'
        });
      };
    }

  function editItemCtrl($scope, $mdDialog) {
    this.cancel = $mdDialog.cancel;
    function success(item) {
      $mdDialog.hide(item);
    }
  }

})();
