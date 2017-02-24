(function () {
  'use strict';

  angular.module('app')
    .controller('ConversionUploadCtrl', [
      '$scope', 'Conversion',
      ConversionUploadCtrl
    ]);

  function ConversionUploadCtrl($scope, Conversion) {
    $scope.app.subtitle = 'Conversion upload';

    var regexp = /^[0-9a-zA-Z]+,\s*([0-9]+\.?[0-9]*)?\s*,\s*[0-9a-zA-Z]*\s*$/;
    $scope.conversionSave = function(){
      var valid=true;
      var contents = $scope.conversionContent.split("\n");
      contents.forEach(function(content){
        if (!regexp.test(content)) {
          valid = false;
        }
      });
      $scope.form.conversionContent.$setValidity("valid", valid);
      if (!valid) {
        return;
      }

      Conversion.save({content:contents},function(result){
      });
    };

    $scope.conversionClose = function(){
      $scope.conversionContent = '';
    };
  }
})();
