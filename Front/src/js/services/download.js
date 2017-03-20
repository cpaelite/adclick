angular.module('app').factory('FileDownload', function () {
  return{
    downloadFile: function (data, mimeType, fileName) {
      var success = false;
      var blob = new Blob([data], { type: mimeType });
      try {
        if (navigator.msSaveBlob)
          navigator.msSaveBlob(blob, fileName);
        else {
          // Try using other saveBlob implementations, if available
          var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
          if (saveBlob === undefined) throw "Not supported";
          saveBlob(blob, fileName);
        }
        success = true;
      } catch (ex) {
        console.log("saveBlob method failed with the following exception:");
        console.log(ex);
      }

      if (!success) {
        // Get the blob url creator
        var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
        if (urlCreator) {
          // Try to use a download link
          var link = document.createElement('a');
          if ('download' in link) {
            // Try to simulate a click
            try {
              // Prepare a blob URL
              var url = urlCreator.createObjectURL(blob);
              link.setAttribute('href', url);

              // Set the download attribute (Supported in Chrome 14+ / Firefox 20+)
              link.setAttribute("download", fileName);

              // Simulate clicking the download link
              var event = document.createEvent('MouseEvents');
              event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
              link.dispatchEvent(event);
              success = true;

            } catch (ex) {
              console.log("Download link method with simulated click failed with the following exception:");
              console.log(ex);
            }
          }

          if (!success) {
            // Fallback to window.location method
            try {
              // Prepare a blob URL
              // Use application/octet-stream when using window.location to force download
              var url = urlCreator.createObjectURL(blob);
              window.location = url;
              console.log("Download link method with window.location succeeded");
              success = true;
            } catch (ex) {
              console.log("Download link method with window.location failed with the following exception:");
              console.log(ex);
            }
          }
        }
      }

      if (!success) {
        // Fallback to window.open method
        console.log("No methods worked for saving the arraybuffer, using last resort window.open");
        window.open("", '_blank', '');
      }
    }
  }
});