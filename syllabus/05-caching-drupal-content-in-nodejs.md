# 5. Caching Drupal Content in Node.js

## Outline

- Redis
- Cache concepts
- Activities

## Redis

![](http://drupo.co/images/training/redis.png)

Redis is an open source, BSD licensed, advanced key-value cache and store. It is often referred to as a data structure server since keys can contain strings, hashes, lists, sets, sorted sets, bitmaps and hyperloglogs.

> [Redis](http://redis.io/)

## Cache concepts

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

Always check your cache. Drupal is slow, and you'll want to avoid making a network round-trip if you can.

Take advantage of [multi-get](http://redis.io/commands/mget). This prevents us from making multiple round-trips to Redis. This is especially important if Redis is not physically located near your front-end.

```javascript
client.mget(['my-key', 'my-second-key'], function (err, data) {
  console.log(err, data);
})
```


## Activities

### Requesting Data from Drupal

Require some new libraries we'll need for these activities.

- Require `redis`, `request`, and `crypto`.
- Create a `redis` client, `client = redis.createClient();`

---

```javascript
var express = require('express'),
      path = require('path'),
      adaro = require('adaro'),
      redis = require('redis'),
      request = require('request'),
      crypto = require('crypto'),
      client = redis.createClient(),
      app = express();
```

- Create a route that listens on `/posts` route.
- Request data from Drupal

```javascript
app.get('/posts', function (req, res) {
  request({
    url: 'http://mirzu.restful.webchefs.org:8080/api/v1.2/blogposts',
    json: true
  }, function (error, response, body) {
    return res.send(body);
  });
});
```

> Visit [http://localhost:3000/posts](http://localhost:3000/posts)

Every time someone makes a request for the `/posts` route, an external data source will be fetched. The `request()` function takes two parameters, an object with some options, and a callback; in the call back is where you can return the data.

- `url` is our remote environment
- `json` lets request know that our response is JSON and it should automatically parse the response.

For the callback function you get three variables, `error`, `response`, `body`.

### Cache Drupal Response

Store the remote url and our `cacheKey` as variables so they can be reused. Make sure these variables are declared within the `app.get()` callback.

```javascript
var remote = 'http://mirzu.restful.webchefs.org:8080/api/v1.2/blogposts',
    cacheKey = crypto.createHash('sha1').update(req.url + port).digest('hex');
```

- Change the `url` option of _request_ to be the `remote` variable. 

Your `cacheKey` is a `sha1` hash of the request URL and the port (combined). This is something that should be unique to each request, otherwise you might accidentally return incorrect data.

Now, request the _data_ at the specific key we just created. This should be included within the `app.get()` callback. With just this you'll only see `null, null` in the console; we haven't yet set the cache key.

```javascript
client.get(cacheKey, function (err, reply) {
  console.log(err, reply)
});
```

**We only want to make requests to Drupal if there is nothing in our cache.**

Every HTTP request you have to make will slow down your application. Speed matters. _Cache everything!_

---

```javascript
client.get(cacheKey, function (err, reply) {
  if (reply !== null) {
    return res.send(reply);
  }
  else {
    request({
      url: remote,
      json: true
    }, function (error, response, body) {
      return res.send(body);
    });
  }
});
```

In this instance we're only making a request to Drupal if the `reply` from Redis was `null`. 

We can use the `.set()` method from the node-redis library to save the response from Drupal in Redis. 

```javascript
client.set(key, value, function (err, reply) {
  // DO STUFF
});
```

- Use `client.set()` to store the response from Drupal in Redis.
- Ensure the JSON is stored as a string in Redis, and parsed when returned. 

---

```javascript
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
```

### _Even More Advanced_

- Use a `multi object` to set cached data at it's `ttl`.
- Create a dust template to render this data.
- Create an optional route parameter to filter all posts by their id
  - Change the template for this single post.
