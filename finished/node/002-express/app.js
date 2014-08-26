var express = require('express');
var app = express();
var http = require('http');
var drupalUrl = '{drupal.services.url}';

app.get('/:nid', function(req, res){
  // req.params.nid exists here
  var requestPath = drupalUrl + req.params.nid;

  http.get(requestPath, function (proxyResponse) {
    proxyResponseCode = Number(proxyResponse.statusCode);
    res.statusCode = proxyResponse.statusCode;
    proxyResponse.pipe(res, {end: true});
  });

});

app.listen(3000);
