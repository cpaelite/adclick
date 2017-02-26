(function () {
  'use strict';

  angular.module('app')
    .controller('SetUpCtrl', [
      '$scope', '$timeout', 'Setup',
      SetUpCtrl
    ]);

  function SetUpCtrl($scope, $timeout, Setup) {
    $scope.app.subtitle = 'SetUp';

    Setup.get(null, function (setup) {
      $scope.item = setup.data;
    });
    /*Domains.get(null, function (domains) {
      var domains = domains.data;
      domains.internal.forEach(function (internal) {
        if (internal.main) {
          $scope.mainDomain = internal.address;
          return;
        }
      });
      domains.custom.forEach(function (custom) {
        if (custom.main) {
          $scope.mainDomain = custom.address;
          return;
        }
      });

      $scope.item.clickurl = "http://" + $scope.mainDomain + '/click';
      $scope.item.multiofferclickurl = "http://" + $scope.mainDomain + '/click/1';
    });

    DefaultPostBackUrl.get(null, function (postbackUrl) {
      $scope.item.postbackurl = postbackUrl.data.defaultPostBackUrl;
    });*/

    $scope.btn = {
      copy1: "Copy to clipboard",
      copy2: "Copy to clipboard",
      copy3: "Copy to clipboard",
      copy4: "Copy to clipboard"
    };
    $scope.itemUrlClick = function (copy) {
      $scope.btn[copy] = "Copied";
      $timeout(function () {
        $scope.btn[copy] = "Copy to clipboard";
      }, 2000);
    };
  }
})();
