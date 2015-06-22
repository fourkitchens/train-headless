# 3.5 Intro to ExpressJS

At the end of this section you'll have a basic understanding of NPM, ExpressJS and templates.

## Outline

- What is Express.JS
- What is NPM
- Your first Express Application 
- Templates with DustJS

## What is Express

> Fast, unopinionated, minimalist web framework for Node.js

> Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

Simply, a tool to help you build things for the web.

## What is NPM

> NPM makes it easy for JavaScript developers to share and reuse code, and it makes it easy to update the code that you're sharing.
 
> DO NOT USE `sudo npm install -g`

NPM is a package manger for node. It controls local and global dependencies. If you already have Node.JS installed, you should have NPM. NPM keeps it's information about your project in a `package.json` file.

```json
{
  "name": "0-introduction-to-express",
  "version": "1.0.0",
  "description": "Introduction to ExpressJS",
  "main": "app.js",
  "dependencies": {
    "adaro": "^1.0.0-15",
    "express": "^4.12.4"
  }
}
```

To ensure that everything is operating normally run, `npm -v` .

### NPM Tricks

* You can run `npm init` to help you scaffold your `package.json` file.
* For dependencies you can keep `dev` dependencies separate with `--save-dev`.
  * When deploying use, `npm install --production`.
* You can use `git` repositories as dependencies.
  * If you have version `1.1.65` or greater you can use GitHub URLs, `"mocha": "mochajs/mocha"` 
  * [More Information](https://docs.npmjs.com/files/package.json#git-urls-as-dependencies)

## Your first Express Application

Lets build a basic express app, with routes, some middleware and a template engine. All this work will take place in the `0-introduction-to-express` folder in the `workspace` directory.

> This directory should empty, except for a `.gitkeep` file.

### Setup

* Type `npm init` to get started creating out `package.json` file.
  *  Most of these options don't matter for this exercise. However the entry point should be `app.js` to be consistent with the finished examples.

Your prompt should look very similar to the following (_I've removed some parts_), 

```shell
This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

Press ^C at any time to quit.
name: (0-introduction-to-express)
version: (1.0.0)
description:
entry point: (index.js) app.js
test command:
git repository:
keywords:
author:
license: (ISC)
About to write to $HOME/Developer/training/train-headless/workspace/node/0-introduction-to-express/package.json:


Is this ok? (yes)
```

Create your `*.js` file. If you happened to have left the entry point value of your `package.json` as `index.js`, that's fine. 

* Run `touch app.js`, or `touch index.js`, depending on what the entry point is for your application.
* Run `npm install --save express adaro`. This will install _local_ copies of the Express and Adaro libraries.

> DO NOT USE `sudo npm install -g`

> When working with Node.JS, in general, your dependencies are local to the project, not managed globally.

### Creating your Application

At minimum, your application will create a new instance of the Express object and begin listening on a particular port.

Node uses the CommonJS module system. Node has a simple module loading system. In Node, files and modules are in one-to-one correspondence.

If the module identifier passed to require() is not a native module, and does not begin with `/`, `../`, or `./`, then Node starts at the parent directory of the current module, and adds `/node_modules`, and attempts to load the module from that location. If it is not found there, then it moves to the parent directory, and so on, until either the module is found, or the root of the tree is reached.

> Node has several modules compiled into the binary.

At this point running, `node app.js`, this will yield nothing. However, if you have completed the setup tasks correctly, this will run without issues. 

:boom:

```javascript
(function () {
  var express = require('express'),
      app = express();

  app.listen(process.env.PORT || 3000);

  return app;
})();
```

Let's add a few simple routes to the application. Express can respond to various HTTP verbs as API [methods](http://expressjs.com/4x/api.html#app.METHOD).

> If you want to have a route listen on all methods, you can use `.all()`

```javascript
app.get('/example', function (req, res) {
    res.send('Welcome to TCDC.');
});
```

Express adds a simple `.send()` method to the response object. This abstracts away most of the boilerplate code to handle responses. We'll look at some more interesting things to send in just a moment.

Start your app with `node app.js`, and visit `http://localhost:3000/example` in your browser.

> Tell me what this matches on, and what it doesn't. 

Lets create a `model` object; you can use the sample below, and create a new route to send this object. 

```javascript
var model = {
  name: 'my-name',
  location: 'my-location',
  vice: 'Coffee'
};
```

> Any ideas what will happen when you vist `/api`?

```javascript
app.get('/api', function (req, res) {
  res.send(model);
});
```

> Maybe you want to send files.

#### Activities - Send File

* Require the `path` module
* Create a route that listens on the `get` HTTP method and serves the `package.json` file.
  * _This is probably a bad idea in production, so just use this for an example._

```javascript
var path = require('path');

app.get('/packagejson', function (req, res) {;
  res.sendFile(path.join(__dirname, 'package.json'));
});
```

---

* An absolute path is required to use `res.sendFile()`
* The `join` method from the path library accepts unlimited arguments and returns a string. 
* `__dirname` is a global for the name of the directory that the currently executing script resides in.

### Templates

> [Adaro](https://www.npmjs.com/package/adaro) - An expressjs plugin for handling DustJS view rendering.
> [DustJS](http://www.dustjs.com) - A JavaScript templating engine. It inherits its look from the [ctemplate](https://code.google.com/p/ctemplate/) family of languages, and is designed to run asynchronously on both the server and the browser.

* Require `adaro`.

```javascript
app.set('views', 'views');
app.engine('dust', adaro.dust({cache: false}));
app.set('view engine', 'dust');
```

> What is happening here?

---

* Let Express know where our views are located.
* Create an engine called `dust` that can be used later.
* Set the _view engine_ to be the previously created engine, `dust`.
* Enable the use of the `.render()` method on the response.

#### Activities - Template Basics

* Create a template file, `index.dust` in `./views/`.
* Use the following, 

```html
<html>
  <head>
    <title>WELCOME TO TCDC.</title>
  </head>
  <body>
    <h1>{name}, welcome to TCDC.</h1>
    <h2>Check out my sweet blog.</h2>
  </body>
</html>
```

* Create a route that listens on the `get` HTTP method, and renders the _model_ object against the template we just created.

---

```javascript
app.get('/', function (req, res) {
  res.render('index', model);
});
```

* Listening on the _home_ route.
* Using the `index.dust` template, with the model object as it's data.

---

#### Activities - Intermediate Templates

* Create a `posts.js` with the following content, require this file.

```javascript
module.exports = {
  name: 'Matthew',
  posts: [
    {
      'id': 1,
      'title': 'Welcome to TCDC',
      'body': 'This is the first entry in my TCDC travel log.',
      'published': '6/26/2015'
    },
    {
      'id': 2,
      'title': 'TCDC is over.',
      'body': 'On my way home from TCDC',
      'published': '6/27/2015'
    }
  ]
}
```

* Create an article template, you can start from `index.dust` for this content.
  * Dust.JS documentation on looping, [http://www.dustjs.com/guides/getting-started/#looping](http://www.dustjs.com/guides/getting-started/#looping) 
* Create a route that listens on the `get` HTTP method, uses this article listing template, and renders the new content.

---

```javascript
app.get('/articles', function (req, res) {
 res.render('articles', content);
});
```

```html
<html>
  <head>
    <title>Articles from TCDC</title>
  </head>
  <body>
    <h1>{name}, welcome to TCDC.</h1>
    <h2>Check out my sweet blog.</h2>
    {#posts}
      <h3><a href="/article/{id}">{title}</a></h3>
      <p>{body}</p>
    {/posts}

  </body>
</html>
```

#### Activities - Advanced Templates

* Create an individual article template
* Create a route which modifies it's output based on a query or route parameter. 
  * Return just a single post matching on `post.id` 
