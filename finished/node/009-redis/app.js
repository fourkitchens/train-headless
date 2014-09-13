var express         = require('express'),
    app             = express(),
    request         = require('request'),
    drupalUrl       = 'http://test.dev/drupal.json',
    redis           = require('redis'),
    client          = redis.createClient();
    dust            = require('./dist/index.js'),
    bodyParser      = require('body-parser');

app.use(bodyParser.json());

var helpers         = {
      key_exists    : function (key,callback) {
        client.exists(key, function (err, doesExist) {
          switch(doesExist){
            case 0: // the key does not exist
              callback(false, {});
              break;
            case 1: // the key exists
              client.hgetall(key, function (err, obj){
                callback(true, obj);
              });
              break
          }
        });
      },
      key_set       : function (key, data, callback) {
        client.hmset(key, data, callback);
      }
    };

app.get('/:nid', function(req, res){
  var options = {
    //'url'   : drupalUrl + req.params.nid,
    'url'   : drupalUrl,
    'json'  : true
  };
  helpers.key_exists('node:'+req.params.nid, function(status, data) {
    if (!status) {
      request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          dust.render('index.dust', body, function(err, html_out) {
            helpers.key_set('node:'+req.params.nid,{'body' : JSON.stringify(body), 'html' : html_out}, function(){
              res.send(html_out);
              client.expire('node:'+req.params.nid, 60);
            })
          });
        }
      });
    }
    else {
      res.send(data.html);
    }
  });
});

app.post('/cacheclear', function(req, res){
  if (req.body.keys.length > 0){
    for (var i = 0; i < req.body.keys.length; i++){
      client.del(req.body.keys[i]);
    }
  }
  res.status(200).end();
});

app.listen(3000);
