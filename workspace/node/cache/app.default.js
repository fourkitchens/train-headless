(function () {
  var express = require('express'),
      path = require('path'),
      adaro = require('adaro'),
      app = express();

  var port = process.env.PORT || 3000;

  app.set('views', 'views');
  app.engine('dust', adaro.dust({cache: false}));
  app.set('view engine', 'dust');

  app.listen(port);

  return app;
})();
