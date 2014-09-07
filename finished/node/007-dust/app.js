var express         = require('express'),
    app             = express(),
    request         = require('request'),
    drupalUrl       = '{drupal.services.url}',
    dust            = require('./dist/index-stream.js');

app.get('/:nid', function(req, res){
  var options = {
    'url'   : drupalUrl + req.params.nid,
    'json'  : true
  };
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var chunkedResponse = [];
      dust.stream('index-stream.dust', body)
        .on('data', function(data) {
          chunkedResponse.push(data);
        })
        .on('end', function() {
          res.send(chunkedResponse.join(''));
        })
        .on('error', function(err) {
          res.send('error, yo.');
        });
    }
  });
});

app.listen(3000);
