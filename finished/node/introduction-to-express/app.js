(function () {
  var express = require('express'),
      path = require('path'),
      adaro = require('adaro'),
      content = require('./posts'),
      app = express();

  var model = {
    name: 'Matthew',
    location: 'San Diego',
    vice: 'Coffee',
    age: 30
  };

  app.set('views', 'views');
  app.engine('dust', adaro.dust({cache: false}));
  app.set('view engine', 'dust');

  app.get('/', function (req, res) {
    res.render('index', content);
  });

  app.get('/articles', function (req, res) {
    res.render('article', content);
  });

  app.get('/article/:id', function (req, res) {
    res.render('article', content.posts.filter(function (item) {
      return Number(req.params.id) === item.id;
    }));
  });

  app.get('/packagejson', function (req, res) {;
    res.sendFile(path.join(__dirname, 'package.json'));
  });

  app.get('/example', function (req, res) {
    res.send('Welcome to NYC Camp.');
  });

  app.get('/api', function (req, res) {
    res.send(model);
  });

  app.listen(process.env.PORT || 3000);

  return app;
})();
