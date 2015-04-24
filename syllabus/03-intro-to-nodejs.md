# 3 Intro to Node.js

At the end of this section you'll have a basic understanding of Node.js ®, Promises, and basic async concepts.

## What is Node.js? An Introduction.

> Node.js ® is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications that run across distributed devices.

## Events, threads, forking, concurrency, what?

The traditional concurrency model is to spawn a new child process to serve each connection. The parent process will remain available for listening to new connections. Each new connection results in the creation of a child process dedicated to it.

> This gets expensive.

The same code is running in each process (or each thread) but from the OS perspective they are different tasks. Multi-tasking is achieved through CPU-time multiplexing also known as time-sharing.

[Scheduling](http://en.wikipedia.org/wiki/Scheduling_%28computing%29)

> And it gets worst if the processes need to wait for something.

### Wait & Blocking

There are many occasions on which a process or a thread will have to wait. It will wait for some external events to be completed before they can continue. Such occasions are IO. Blocking IO (or synchronous IO) will tie up the system resources as the waiting processes cannot be used for some other action.

However the system (your OS) is not stuck while IO is happening. The system is going to interrupt the process waiting for an IO operation, allowing the CPU to be used by another process.

### Events!

The alternative is to use an event-driven model. This has proved useful in many products such as Nginx, Twisted, or EventMachine.

In an event model, everything runs in one process, one thread. Instead of spawning a new process/thread for each connection request, a event is emitted and the appropriate callback for that event is invoked.

> Callback hell.

In event-driven model, all the events are treated by a gigantic loop know as the event-loop.

* Requests, etc. arrive
* Added to the _event loop_
* Each event registers a callback, and executes it operation. 
* Operation completes and triggers the callback. 
* Next event is processed.

> Imagine a king with servants.

Every morning all the servants line up, one at a time they come into his throne room. They report on what they've done, sometimes the king gives them more to do. Always one at a time, so the king can focus.

## Why is PHP & Drupal bad at handling concurrency?

Drupal has a large memory foot print. You might need to allocate 100mb just to serve some JSON. 

> Exaggerated

However, everything happens in order. Each IO operation blocks all subsequent ones. A _100ms_ request to the DB will block process execution. 

### Why not write non-blocking, event-driven PHP?

> [Photon](http://www.photon-project.com/)

### HHVM and Evented PHP

Drupal 8 core runs without issue within HHVM. [ReactPHP](http://reactphp.org/)

## Why Node?

Chrome's JavaScript runtime is called V8, it's one of the reasons Chrome is considered so fast. Node.js leverages V8's speed on the server. Only one thing gets executed at a time, but libraries allow I/O or other intensive tasks to be executed asynchronously so the script doesn't need to wait for them to finish.

* Rapid prototyping
* **API Glue**
* Queue'ish stuff
* Message passing

* V8 Engine
* Asynchronous libraries
* Event Driven.

### Why do we need another server-side language, framework?

PHP is slow. We actually mean Drupal, and we mean it's bad at concurrency.

## ASYNC Example

```javascript
var fs  = require('fs'),
    sys = require('sys');

fs.readFile('treasure-chamber-report.txt', function readFile (report) {
  sys.puts('oh, look at all my money: ' + report);
});

fs.writeFile('letter-to-princess.txt', '...', function writeFile () {
  sys.puts('can not wait to hear back from her!');
});
```

We don't need to wait for the file being read, to write the file. Both System IO calls are started independently.

# Promises

Promises originally based on EventEmitters were part of Node. Some rudimentary support for promises in the `0.2.x` era. However this was removed and we've stuck with the callback style. This can result in what _everyone_ referrers

```javascript
foo.bar('baz', function (error, value) {
  if (error) {
    // error
  }
  else {
    // ok
  }
});
```

## Promise Terminology

* **Fulfillment** - When a successful promise is fulfilled, all of the pending callbacks<sup>1</sup> are called with the value. Fulfillment is the asynchronous analog for returning a value.
* **Rejection** - When a promise cannot be fulfilled, a promise is `rejected` which invokes the errbacks<sup>2</sup> that are waiting. Rejection is the asynchronous analog for throwing an exception.
* **Resolution** - A promise is resolved when it makes progress toward fulfillment or rejection. A promise can only be resolved once, and it can be resolved with a promise instead of a fulfillment or rejection.

## Thenables

CommonJS promises are sometimes referred to as _thenables_. This term derives from the then method available on a promise. The then method is the gateway to attaching callbacks<sup>1</sup>, and errbacks<sup>2</sup>.

## [Q](https://github.com/kriskowal/q)

> On the first pass, promises can mitigate the “Pyramid of Doom”: the situation where code marches to the right faster than it marches forward.

```javascript
step1(function (value1) {
  step2(value1, function(value2) {
    step3(value2, function(value3) {
      step4(value3, function(value4) {
        // Do something with value4
      });
    });
  });
});
```

With a promise library, you can flatten the pyramid.

```javascript
Q
  .fcall(promisedStep1)
  .then(promisedStep2)
  .then(promisedStep3)
  .then(promisedStep4)
  .then(function (value4) {
    // Do something with value4
  })
  .catch(function (error) {
    // Handle any error from all above steps
  })
  .done();
```

**[1]** Callback: A function executed if a a promise is fulfilled with a value.
**[2]** Errback: A function executed if a promise is rejected, with an exception.
