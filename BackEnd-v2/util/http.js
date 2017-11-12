var http=require('http');
var querystring=require('querystring');
  

export async function httpRequestPost(url = '', data = '',callBack='') {
  console.log(`http:post==================================`)
  //发送 http Post 请求
  var postData=querystring.stringify({
    msg:'中文内容'
  });
  var options={
     hostname:'www.gongjuji.net',
     port:80,
     path:'/',
     method:'POST',
     headers:{
      //'Content-Type':'application/x-www-form-urlencoded',
      'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
      'Content-Length':Buffer.byteLength(postData)
     }
  }
  
  var req=http.request(options, function(res) {
    var responseText=[];
    var size = 0;
    //console.log('Status:',res.statusCode);
    //console.log('headers:',JSON.stringify(res.headers));
    //res.setEncoding('utf-8');
    res.on('data',function(data){
      //console.log('body分隔线---------------------------------\r\n');
      responseText.push(data);
      size+=data.length;
    });
    res.on('end', function () {
      // Buffer 是node.js 自带的库，直接使用
      responseText = Buffer.concat(responseText,size);
      responseText = responseText.utf8Slice(0, size);
      callBack(responseText);
      return responseText
    });
    req.on('error',function(err){
      console.error(err);
    });
  });
  /**/
  req.write(postData);
  req.end();
}




/*class myHttpRequest {
  post(url = '', data = '',callBack='') {
    console.log(`http:post==================================`)
    //发送 http Post 请求
    var postData=querystring.stringify({
      msg:'中文内容'
    });
    var options={
       hostname:'www.gongjuji.net',
       port:80,
       path:'/',
       method:'POST',
       headers:{
        //'Content-Type':'application/x-www-form-urlencoded',
        'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length':Buffer.byteLength(postData)
       }
    }
    var req=http.request(options, function(res) {
      console.log('Status:',res.statusCode);
      console.log('headers:',JSON.stringify(res.headers));
      res.setEncoding('utf-8');
      res.on('data',function(chun){
        console.log('body分隔线---------------------------------\r\n');
        //console.info(chun);
        callBack(chun)
        //console.log('No more data in response.********');
        return chun
      });
    });
    req.on('error',function(err){
      console.error(err);
      return []
    });
    req.write(postData);
    req.end();
  }
}

module.exports = function () {
  return new myHttpRequest()
}*/