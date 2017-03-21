angular.module('app').factory('FileDownload', ['$http', downloadFile]);
function downloadFile($http) {
  return {
    download: function (params) {
      $http.get('/api/report', {params: params}).then(function(response) {
        var fileName = response.headers('content-disposition').split(";")[1].split("=")[1];
        var fileName = fileName.substring(1, fileName.length-1);
        var element = angular.element('<a/>');
        element.attr({
          href: 'data:attachment/csv;charset=utf-8,' + encodeURI(response.data),
          target: '_blank',
          download: fileName
        })[0].click();
      }, function(response) {
        console.log('Download error: ' + response);
      });
    }
  };
}
