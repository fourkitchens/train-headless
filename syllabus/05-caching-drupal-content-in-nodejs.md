# 5. Caching Drupal Content in Node.js

## Redis

![](http://drupo.co/images/training/redis.png)

> Redis is an open source, BSD licensed, advanced key-value cache and store. It is often referred to as a data structure server since keys can contain strings, hashes, lists, sets, sorted sets, bitmaps and hyperloglogs.

-- [Redis](http://redis.io/)

### Performance?

Redis is fast.

Keys are stored 'in-memory', database is saved to disk incrementally.

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

```
====== SET ======
  1000000 requests completed in 14.82 seconds
  50 parallel clients
  3 bytes payload
  keep alive: 1

98.81% <= 1 milliseconds
99.95% <= 2 milliseconds
99.98% <= 3 milliseconds
99.99% <= 4 milliseconds
99.99% <= 5 milliseconds
99.99% <= 6 milliseconds
100.00% <= 7 milliseconds
100.00% <= 8 milliseconds
100.00% <= 8 milliseconds
67476.38 requests per second
```

These numbers are from my Macbook Air, this computer.

Don't rely on just benchmarks. Test, collect data, analyze.

[Redis Benchmarks](http://redis.io/topics/benchmarks)

[Scaling Redis at Twitter](https://www.youtube.com/watch?v=rP9EKvWt0zo)




### Redis Clients

[Clients](http://redis.io/clients)

#### PHP
There are plently of Redis clients for nearly every language. PHP, `Predis` and `phpredis`. phpredis is particularly interesting, a client written in C as a PHP Module.

#### Node.JS
[Node Redis](https://github.com/mranney/node_redis)

We'll be using `node_redis` for this training.

> This is a complete Redis client for node.js. It supports all Redis commands, including many recently added commands like EVAL from experimental Redis server branches.

```
npm install redis
```

:boom:

### Some Examples

```javascript
var redis = require("redis"),
    client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
   console.log("Error " + err);
});

client.set("string key", "string val", redis.print);
client.hset("hash key", "hashtest 1", "some value", redis.print);
client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
client.hkeys("hash key", function (err, replies) {
   console.log(replies.length + " replies:");
   replies.forEach(function (reply, i) {
       console.log("    " + i + ": " + reply);
   });
   client.quit();
});
```


```
$ node example.js
Reply: OK
Reply: 0
Reply: 0
2 replies:
    0: hashtest 1
    1: hashtest 2
```

Hiredis parser (c bindings) is faster, but if you're hitting the limit of the native JS parser you might be doing something wrong at a higher level, or running at a pretty massive scale.

### Checking Redis before Drupal

Redis is fast. Let's use it for some of the things it's good at.

Check if our key exists in Redis, No. Request some JSON to render, render that with Dust and send the output to the client. That's around 16ms.

That's still very fast.

But let's speed it up.

> Rendered HTML from Dust? Let's save that in Redis.

Check if our key exists, Yes? Send HTML to the client. 5ms.

That's blazing fast.

```javascript
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
    'url'   : drupalUrl + req.params.nid
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

app.listen(3000);
```


All interaction with Redis takes place on this `client` object.

```javascript
redis   = require('redis');
client  = redis.createClient();
```

The Node.JS Redis library supports all Redis commands, including many recently added commands like EVAL from experimental Redis server branches.

Even some fancy helpers.

```javacsript
client.hgetall({KEY}, function (err, obj) {
    console.dir(obj);
});
```

> The reply from an HGETALL command will be converted into a JavaScript Object by node_redis. That way you can interact with the responses using JavaScript syntax.

`helpers.key_exists({KEY},{CALLBACK})`

Find out as fast as possible if our key exists. If it does, return it's value.

```javascript
client.hgetall(key, function (err, obj){
  callback(true, obj);
});
```

This results in around a 5ms round trip (local, obviously).

> Our key doesn't exist, request the JSON and render it.

```javascript
request(options, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    dust.render('index.dust', body, function(err, html_out) {
      // Do Stuff..
    });
  }
});
```

That rendered HTML is pretty valuable. Let's save it.

```javascript
helpers.key_set('node:'+req.params.nid,{'body' : JSON.stringify(body), 'html' : html_out}, function(){
  // Do Stuff.
})
```

More direct 1:1 Redis commands.

```javascript
client.hmset(key, data, callback);
```

Send our rendered html output to the client after we've saved the key.
`res.send(html_out);`

### If you get ahead TTL Bonus

> Redis expires. You can set a timeout to a key, which is, a limited time to live. When the time to live elapsed, the key is automatically destroyed, exactly like if the user called the DEL command with the key.

* They can be set both using seconds or milliseconds precision.
* However the expire time resolution is always 1 millisecond.
* Information about expires are replicated and persisted on disk, the time virtually passes when your Redis server remains stopped (this means that Redis saves the date at which a key will expire).

Set a key with the cli.
```
~: redis-cli set batman robin
OK
```

Set it's ttl/epire value.
```
~: redis-cli expire batman 100
(integer) 1
```

You can use ttl to see how long a key has to live.
```
~: redis-cli ttl batman
(integer) 79
```

The ttl value has no effect on normal key-related operations
```
~: redis-cli get batman
"robin"
```

The key has expired.
```
~: redis-cli ttl batman
(integer) -2
```

And, deleted.
```
~: redis-cli get batman
(nil)
```

How does this apply to us?

```javascript
client.expire('node:'+req.params.nid, 60);
```

To keep our content fresh, let's set the TTL of our key to 60 (seconds). Our JSON response, and our rendered HTML will be removed from Redis after just 60 seconds.

## Clearing Redis from Drupal

```javascript
app.post('/cacheclear', function(req, res){
  if (req.body.keys.length > 0){
    for (var i = 0; i < req.body.keys.length; i++){
      client.del(req.body.keys[i]);
    }
  }
  res.status(200).end();
});
```

> Post request, that accepts JSON.

```bash
curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"keys":["node:60"]}' http://localhost:3000/cacheclear
```

Drupal can blindly pass an array of keys to our Node.JS app which will clear the keys.

### Bonus.

Add some error handling for keys that don't exist. Check for keys that exist.

## Bonus!

Cache-Manager

https://www.npmjs.org/package/cache-manager

### Installing & Running Redis

OSX - `~: brew reinstall redis`

*You're using Homebrew right?*

Ubuntu/*nix -
```
wget http://download.redis.io/releases/redis-2.8.15.tar.gz
tar -xvzf redis-*.tar.gz
cd redis-2.8.15
make
```

You might need `build-essential` and `tcl` on Ubuntu, depending on your previous configuration.

```
~: redis-server /usr/local/etc/redis.conf
```
