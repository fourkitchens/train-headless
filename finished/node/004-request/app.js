var express         = require('express'),
    app             = express(),
    request         = require('request'),
    drupalUrl       = '{drupal.services.url}';

app.get('/:nid', function(req, res){
  var options = {
    'url'   : drupalUrl + req.params.nid,
    'json'  : true
  };
  request(options).pipe(res);
});

app.listen(3000);
