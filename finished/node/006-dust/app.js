var express         = require('express'),
    app             = express(),
    request         = require('request'),
    drupalUrl       = '{drupal.services.url}',
    dust            = require('./dist/index.js');

app.get('/:nid', function(req, res){
  var options = {
    'url'   : drupalUrl + req.params.nid,
    'json'  : true
  };
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      dust.render('index.dust', body, function(err, html_out) {
        res.send(html_out);
      });
    }
  });
});

app.listen(3000);
