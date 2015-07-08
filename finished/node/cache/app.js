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

  app.get('/posts/:id?', function (req, res) {
    var remote = 'http://finished.drupal.headless.4kclass.com:8080/api/v1.2/articles',
        template = 'posts',
        cacheKey = crypto.createHash('sha1').update(req.url + port).digest('hex');

    if (req.params.id) {
      remote += '/' + req.params.id;
      template = 'post';
    }

    client.get(cacheKey, function (err, reply) {
      if (reply !== null) {
        return res.render(template, JSON.parse(reply));
      }
      else {
        request({
          url: remote,
          json: true
        }, function (error, response, body) {
          if (!error && response.statusCode === 200) {
            client.multi([
              ['set', cacheKey, JSON.stringify(body)],
              ['expire', cacheKey, 800]
            ]).exec(function (error, replies) {
              return res.render(template, body);
            });
          }
        });
      }
    });
  });

  app.listen(port);

  return app;
})();
