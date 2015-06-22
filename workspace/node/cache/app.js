(function () {
  var express = require('express'),
      path = require('path'),
      adaro = require('adaro'),
      redis = require('redis'),
      request = require('request'),
      crypto = require('crypto'),
      client = redis.createClient(),
      app = express();

  var port = process.env.PORT || 3000;

  app.set('views', 'views');
  app.engine('dust', adaro.dust({cache: false}));
  app.set('view engine', 'dust');

  app.get('/posts', function (req, res) {
    var remote = 'http://mirzu.restful.webchefs.org:8080/api/v1.2/blogposts',
        cacheKey = crypto.createHash('sha1').update(req.url + port).digest('hex');


    client.get(cacheKey, function (err, reply) {
      if (reply !== null) {
        return res.send(JSON.parse(reply));
      }
      else {
        request({
          url: remote,
          json: true
        }, function (error, response, body) {
          client.set(cacheKey, JSON.stringify(body), function (err, reply) {
            return res.send(body);
          });
        });
      }
    });

  });

  app.listen(port);

  return app;
})();
