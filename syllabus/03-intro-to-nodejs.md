# 3 Intro to Node.js

## At the end of this section students will also have:
- Working express app
-- Pulls a node from Drupal (Async example)

## What is Node.js? An Introduction.

> Node.js is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications that run across distributed devices.

*FROM NODEJS.ORG*

> Node.js is a platform built on Chrome's JavaScript runtime [...] 

* Chrome's JavaScript runtime is called V8, it's one of the reasons Chrome is considered so fast.
* Node.js leverages V8's speed on the server!

> [...] easily building fast, scalable network applications. 

* Node wants to act as a message passer (more on this later).

> Node.js uses an event-driven, non-blocking I/O model [...] 

* Only one thing gets executed at a time, but libraries allow I/O or other intensive tasks to be executed asynchronously so the script doesn't need to wait for them to finish.

### FAST and SCALEABLE

> What makes Node.js FAST and SCALEABLE?

* V8 Engine
* Asynchronous libraries
* Event Driven.

> Why do we need another server-side language, framework?

> PHP IS SLOW ?!

We actually mean Drupal, and we mean it's bad at concurrency.

### Why is PHP/Drupal bad at handling concurrency?

* Big memory foot print.
    * If you need to load 100Meg of Code to deliver 4 lines of JSON. . .
* Everything happens in order.
    * Your 100ms database call will hold up the execution of the entire process.
    * Your next 100ms call will do the same, etc.
    * Only after all the database calls have completed can we return the 4 lines of JSON.
    
### In Node

Everything happens in parallel except for your code.

> Imagine a king with servants.

Every morning all the servants line up, one at a time they come into his throne room. They report on what they've done, sometimes the king gives them more to do. Always one at a time, so the king can focus.

```javascript
var fs  = require('fs');
var sys = require('sys');

fs.readFile('treasure-chamber-report.txt', function readFile(report) {
  sys.puts("oh, look at all my money: "+report);
});

fs.writeFile('letter-to-princess.txt', '...', function writeFile() {
  sys.puts("can't wait to hear back from her!");
});
```

Explain please?

* Code gives Node 2 things to do.
* Each callback gets fired one at a time
* Until one callback is fired all others wait in line

> HOWEVER!

We don't need to wait for the file being read, to write the file. Both System IO calls are started independently.

### Why not write non-blocking, event-driven PHP?

> [Photon](http://www.photon-project.com/)

### What is Node.js good for?

* Rapid prototyping
* **API Glue**
* Queue'ish stuff
* Message passing

### WHat is Node.js not good for?

* General purpose web server
* Complex systems (business logic)

## Express.js

An Introduction

### Getting started

Make sure Node.js is working, `which node`. Check which version of Express is installed, `npm info express version`.

```javascript

var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000);
```

`curl http://localhost:3000`

> hello world

The `app.VERB()` methods provide the routing functionality in Express. With the new application instance you can start defining routes via `app.VERB()`, in this case `GET /`. The `req` and res are the exact same objects that node provides to you, thus you may invoke `req.pipe()`, `req.on('data', callback)` and anything else you would do without Express involved.

```javascript

var express = require('express');
var app = express();
var http = require('http');
var drupalUrl = '{drupal.services.url}';

app.get('/:nid', function(req, res){
  // req.params.id exists here
  var requestPath = drupalUrl + req.params.nid;

  http.get(requestPath, function (proxyResponse) {
    proxyResponseCode = Number(proxyResponse.statusCode);
    res.statusCode = proxyResponse.statusCode;
    proxyResponse.pipe(res, {end: true});
  });

});

app.listen(3000);
```

> What?

### HTTP Get

```javascript
var http = require('http');
```

[HTTP Get](http://nodejs.org/api/http.html#http_http_get_options_callback)

> Since most requests are GET requests without bodies, Node provides this convenience method. The only difference between this method and http.request() is that it sets the method to GET and calls req.end() automatically.

**Convenience Methods!**

```javascript

http.get(requestPath, function (proxyResponse) {
  proxyResponseCode = Number(proxyResponse.statusCode);
  res.statusCode = proxyResponse.statusCode;
  proxyResponse.pipe(res, {end: true});
});
```
