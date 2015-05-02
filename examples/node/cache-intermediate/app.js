var crypto  = require('crypto'),
    express = require('express'),
    app     = express(),
    redis   = require('redis'),
    client  = redis.createClient(),
    port    = 3000;

app
  // Attach a `get` method to the Express app.
  .get('/:title?', function (req, res) {
    // Ensure that even if we don't pass a parameter, one is available.
    req.params.title    = req.params.title || '';

    // Generate both the key, and the value for saving to the cache.
    var key             = crypto.createHash('md5').update(req.params.title).digest('hex'),
        value           = req.params.title + '|' + new Date().toISOString();

    client.get(key, function (err, reply) {
      // If the reply is empty, create and save the key.
      if (!reply) {
        client.set(key, value, function (err, reply) {
          // Return the `key` to the client.
          return res
                  .send(key);
        });
      }
      // If we have a reply, send it.
      else {
        return res
                .send(reply);
      }
    });
  })
  // Attach a listen method, and listen on our port.
  .listen(port, function () {
    console.log('Example app listening at http://localhost:%s', port);
  });
