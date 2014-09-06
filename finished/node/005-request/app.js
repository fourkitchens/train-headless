var express         = require('express'),
    app             = express(),
    request         = require('request'),
    drupalUrl       = '{drupal.services.url}';

app.get('/:nid', function(req, res){
  var options = {
    'url'   : drupalUrl + req.params.nid,
    'json'  : true
  };
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    }
  })
});

app.listen(3000);
