# 5. Caching Drupal Content in Node.js

## Outline

- Intro to Redis
- Performance
- Cache concepts
- Cache examples and workflow

## Redis

![](http://drupo.co/images/training/redis.png)

Redis is an open source, BSD licensed, advanced key-value cache and store. It is often referred to as a data structure server since keys can contain strings, hashes, lists, sets, sorted sets, bitmaps and hyperloglogs.

> [Redis](http://redis.io/)

### Performance

Redis is fast. Keys are stored _in-memory_, database is saved to disk incrementally.

```
~: redis-benchmark -q -n 100000
PING_INLINE: 70821.53 requests per second
PING_BULK: 72463.77 requests per second
SET: 66844.91 requests per second
GET: 70571.62 requests per second
INCR: 69881.20 requests per second
LPUSH: 71123.76 requests per second
LPOP: 68166.33 requests per second
SADD: 69492.70 requests per second
SPOP: 73099.41 requests per second
LPUSH (needed to benchmark LRANGE): 68775.79 requests per second
LRANGE_100 (first 100 elements): 21496.13 requests per second
LRANGE_300 (first 300 elements): 9692.74 requests per second
LRANGE_500 (first 450 elements): 6845.56 requests per second
LRANGE_600 (first 600 elements): 5220.30 requests per second
MSET (10 keys): 42016.80 requests per second
```

Default benchmark runs against a single key.

> One million SET operations, using a random key for every operation out of 100k possible keys.

```
redis-benchmark -t set -r 100000 -n 1000000
```

### Sets

- Cache everything.
- Have a standardized method for creating keys. 
- Figure out early on if you want to cache an item.
- Redis gives you a few ways to make this happen.
  - Hashes
    - Known data structure
    - Only `get`/`set` what you need (this is something you have to figure out)
    - Slow
  - Strings
    - Serialize & De-serialize on each request.

> Luckily native `JSON` support comes with [JavaScript](http://es5.github.io/#x15.12).

In the headless framework we're using the request path, and replacing all forward slashes with colons, `req.path.substr(1).replace(new RegExp('/', 'g'), ':')`.

> How about creating a key for saving `JSON`?

```javascript
var ttl = options.api.body.hasOwnProperty('_ttl') ? options.api.body._ttl : options.config.ttl;
options.req.db.set(options.cache.json, JSON.stringify(options.api.body), function (error) {
  if (error) {
    // handle errors.
  }
  else {
    // handle 'all good'
  }
});
```

Ensure we reject our promise chain if there is an error with Redis, `deferred.reject(helpers.createErrorResponse(500, [error]));`; resolve with the `options` object if everything is good, `deferred.resolve(options)`.

An important note, 

```javascript
.then(cache.get)
.then(api.get)
.then(cache.set)
```

We're setting the cache immediately after getting a value back from the API.

> How about setting the TTL for a key?

### Lookups

Always check your cache. Drupal is slow, and you'll want to avoid making a network round-trip if you can.

Take advantage of [multi-get](http://redis.io/commands/mget). This prevents us from making multiple round-trips to Redis. This is especially important if Redis is not physically located near your front-end.

```javascript
Q
  .ninvoke(options.req.db, 'mget', [options.cache.json, options.cache.key])
  .then(function (results) {
    // success handler
  })
  .fail(function () {
    // fail handler
  });
```

Ensure that all your responses are not empty. Determine if you have cached data after.

## Exercises

### Simple Redis Cache

#### Setting up the application

Add all your required dependences. The `crypto` library is a standard-lib from Node.JS, which is why it's not included in `package.json`.

```javascript
var crypto  = require('crypto'),
    express = require('express'),
    app     = express(),
    redis   = require('redis'),
    client  = redis.createClient(),
    port    = 3000;
```

We're creating an `app`, and a `client` variable to manage our interaction with Express and Redis.

Here we've attached a `get` and a `listen` method to our `app`. 

> Any ideas about what `/:title?` will match; The significance of `:title` and `?` ?

```javascript
app
  // Attach a `get` method to the Express app.
  .get('/:title?', function (req, res) {
    res.send('hello world');
  })
  // Attach a listen method, and listen on our port.
  .listen(port, function () {
    console.log('Example app listening at http://localhost:%s', port);
  });
```

Title is a named parameter. This means you can access it's value from within the `req.params` object. For our next step let's ensure that we always have a value for title, `req.params.title    = req.params.title || '';`.

#### Creating your key/value

This helps us ensure that the keys will be different for each path. 

```javascript
// Generate both the key, and the value for saving to the cache.
var key   = crypto.createHash('md5').update(req.params.title).digest('hex'),
    value = req.params.title + '|' + new Date().toISOString();
```

#### Saving your key

The method, `client.set`, is the same in name to the command that redis provides. The first two parameters are the `key`, and the `value` we created earlier. The third is our callback, which executes and sends our key back to the requesting client. 

```javascript
// Signal Redis to save the key, and the value.
// This is a simple string save. The most basic key type.
client.set(key, value, function (err, reply) {
  // Return the `key` to the client.
  res.send(key);
});
```

### Intermediate Redis Cache

This builds off our previous work. Instead of just setting the key/value, we check to see if a key exists, and use it's reply if it does.

```javascript
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
```

### Bonus Round

Set a `ttl` for the key we just wrote to Redis, ensuring that it auto expires after `60` seconds.
