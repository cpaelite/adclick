var http=require('http');
var querystring=require('querystring');
var rp = require('request-promise');

export async function httpRequestGet(url = '') {
  var options = {
    method: 'GET',
    uri: url,
    headers: {
        /* 'content-type': 'application/x-www-form-urlencoded' */ // Is set automatically
    }
  };
  return new Promise(function(resolve, reject) {
    rp(options)
      .then(function (body) {
        // POST succeeded...
        try {
          resolve(JSON.parse(body));
        }catch (err) {
          resolve(body);
        }
      })
      .catch(function (err) {
          // POST failed...
          reject(err);
      });
  });
}

export async function httpRequestPost(url = '', data = '') {
  var options = {
    method: 'POST',
    uri: url,
    form: data,
    headers: {
        /* 'content-type': 'application/x-www-form-urlencoded' */ // Is set automatically
    }
  };
  return new Promise(function(resolve, reject) {
    rp(options)
      .then(function (body) {
        // POST succeeded...
        try {
          resolve(JSON.parse(body));
        }catch (err) {
          resolve(body);
        }
      })
      .catch(function (err) {
          // POST failed...
          reject(err);
      });
  });
<<<<<<< 2200c66fa025ed1ee64b6e2c1345bf4186345c39
}
=======
}
>>>>>>> 提交
