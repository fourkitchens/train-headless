var express = require('express');
var app = express();
var http = require('http');
var drupalUrl = '{drupal.services.url}';

app.get('/:nid', function(req, res){
  var requestPath,
      proxyResponseCode;

  var requestPath = drupalUrl + req.params.nid;
  http.get(requestPath, function (proxyResponse) {
    proxyResponseCode = Number(proxyResponse.statusCode);
    if (proxyResponseCode < 200 || proxyResponseCode >= 300) {
      res.statusCode = proxyResponse.statusCode;
      /*
       * Explicit handle of 301/302. If the 'location' header contains the proxyHost, replace it with empty string to get the
       * the redirect to go to THIS server.
       */
      try {
        if (proxyResponseCode === 301 || proxyResponseCode === 302) {
          locationStr = proxyResponse.headers.location;
          locationStr = locationStr.replace(proxyHost, '');
          res.setHeader('location', locationStr);
        }
      }
      catch (error) {
        console.error('An error occurred while attempting to set 301/302 headers for the proxied request. error is:', error);
      }
    }
    else {
      res.statusCode = proxyResponse.statusCode;
    }
    proxyResponse.pipe(res, {end: true});
  });
});

app.listen(3000);
