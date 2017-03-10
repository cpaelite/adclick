(function () {
  'use strict';

  angular.module('app')
    .controller('ConversionUploadCtrl', [
      '$scope', 'Conversion',
      ConversionUploadCtrl
    ]);

  function ConversionUploadCtrl($scope, Conversion) {
    $scope.app.subtitle = 'Conversion upload';

    var regexp = /^[0-9a-zA-Z]+(\_[0-9]+)*(,\s*(\s*|[0-9]+\.?[0-9]*)\s*(,\s*[0-9a-zA-Z]*\s*)*)*$/;
    $scope.conversionSave = function(){
      var valid=true;
      var contents = $scope.conversionContent.split("\n");
      contents.forEach(function(content){
        if (!regexp.test(content)) {
          valid = false;
        }
      });
      $scope.form.conversionContent.$setValidity("validate", valid);
      if (!valid) {
        return;
      }

      $scope.conversionStatus = true;
      Conversion.save({keys:contents},function(result){
        $scope.conversionStatus = false;
        if (result.status) {
          $scope.errorMessage = result.data;
        }
      });
    };

    $scope.conversionClose = function(){
      $scope.conversionContent = '';
    };
  }
})();
