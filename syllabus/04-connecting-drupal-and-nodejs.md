# 4. Connecting Node.js and Drupal

## DustJS - The Linkedin fork

### Highlights!

* Async & streaming operation
* Browser/node compatibility
* Extended Mustache/ctemplate syntax
* Clean, low-level API
* High performance

[DustJS](http://linkedin.github.io/dustjs/)

### You like numbers?

> Dust template for this demo compiles in about 30 ms.

Dust templates are compiled to JavaScript for speed of execution.

### Browser & Node.js

DustJS templates can be used for rendering in your application, and in the browser. This has some pretty huge wins.

> Cached templates

Browser templates can be served from a CDN, or other high-performance network. Template files can also be cached in the users browser cache; all you need to send is updated JSON for rendering.

> DRY

Don't repeat yourself. Templates can be comprised of partials; allowing reuse of markup.

> Server side

If your client doesn't support executing javascript, you can use the same Dust template to render on the server side.

> Decouple your logic from presentation.

### Examples

[Show me the code!](https://github.com/linkedin/dustjs/wiki/Dust-Tutorial#Why_JavaScript_Templating)

Your template code,

```html

{title}
<ul>
{#names}
  <li>{name}</li>{~n}
{/names}
</ul>

```

Your JSON data,

```json
{
 "title": "Famous People",
 "names" : [{ "name": "Larry" },{ "name": "Curly" },{ "name": "Moe" }]
}
```

And your rendered output.

```html
Famous People
<ul>
  <li>Larry</li>
  <li>Curly</li>
  <li>Moe</li>
</ul>
```

:boom:

### How do we get this working with Drupal?

```javascript
app.get('/:nid', function(req, res){
  var options = {
    'url'   : drupalUrl + req.params.nid,
    'json'  : true
  };
  request(options).pipe(res);
});
```

Introduction to the request module.

> Simplified HTTP request client. Request is designed to be the simplest way possible to make http calls. It supports HTTPS and follows redirects by default.

* HTTPS Support!
* Follows redirects by default.
* Supports streams

> Options

```javascript
var options = {
  'url'   : drupalUrl + req.params.nid,
  'json'  : true
};
```

Request's first parameter is either the URL you want, or an [object](https://github.com/mikeal/request#requestoptions-callback) with your properties.

Our two that we'll be keeping the same for the purpose of this demonstration.

* url|uri - fully qualified uri or a parsed url object from `url.parse()`
* json - sets body but to JSON representation of value and adds Content-type:

Now what?

```javascript
request(options).pipe(res);
```

Pipe the response from `request` to the response, `res`, provided by express. If you don't care about security, and just want to pass JSON, this is an incredibly easy way to proxy content.

> Don't do this. Care about security.

```javascript
request(options, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    res.send(body);
  }
});
```

If there's no error, and the status code is 200, send the `body` to the client.

Cool.

But we're still just proxying JSON from Drupal, through Node.JS to our clients. Not very useful, *unless this is your usecase*. Let's connect these pieces together and get something special going.

```javascript
request(options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    dust.render('index.dust', body, function(err, html_out) {
      res.send(html_out);
    });
  }
});
```

> Dust.render() What?

```javascript
dust = require('./dist/index.js');
```

Lets backup. How do we get here?

```html
<body class="html js">
  <h1>{title}</h1>
  <h2>{author}</h2>
  {body|s}
</body>
```

A snippet of our Dust template. `{title}` and `{author}` are replacements. When you call `dust.render()` those replacements are translated to keys used to find the appropriate values in your JSON.

> All output values are escaped to avoid Cross Site Scripting (XSS) unless you use filters.

What about `|s`? Hello `{name|s}` suppresses auto-escaping. If your JSON response contains some HTML from Drupal, you'll want supress escaping so the output is rendered correctly.

> If there is no value found for a key, nothing is output.
>
> Template whitespace is largely discarded. See section on whitespace control for details if you want a different behavior. Take special care if you have a JavaScript code block and have comments of the form // message. When all the newlines are removed, this will comment out the following statement. Use the /* message */ form instead.
>
> {! Comment syntax !} is how you write comments

[DustJS Filters](https://github.com/linkedin/dustjs/wiki/Dust-Tutorial#more-on-dust-output-and-dust-filters)

---
## If you get ahead: Compiled templates and HAL libraries

So how do I 'compile' this dust template. We've included a Gulp file for that exact purpose.

> var dust = require('gulp-dust');

```javascript
// DustJS
gulp.task('dust', function () {
  return gulp.src('./templates/**/*.dust')
    .pipe(dust({
      'preserveWhitespace' : true
    }))
    .pipe(wrap({ src: './_src/dust.txt'}))
    .pipe(gulp.dest('dist'));
});
```

Not going to go into too much detail. However, find your templates, pipe to dust compiler, format with our custom template, write to the dist directory.

`npm install && gulp`

:boom: Templates.

Alright, some greater detail.

```javascript
dust.render('index.dust', body, function(err, html_out) {
  res.send(html_out);
});
```

Dust.render(). Each template is registered with `dust`, `dust.register("index.dust",body_0)`. This is the name you'll reference when rendering your content, it's also the first argument in the `dust.render()` function. The second argument, the body; the response from the request you made previously.

Finally, the callback.

> Callback spaghetti is a sign that you're doing something wrong.

![](http://kinlan-presentations.appspot.com/modern-web-apps/images/messofwires.png)

The callback contains just two variables, the error and the rendered html. You should be capturing, and correctly handling that error.

`res.send(html_out);`

You've now sent your rendered html to your client.

:boom:


---
### If you get ahead: Streams

```javascript
var chunkedResponse = [];
dust.stream('index-stream.dust', body)
  .on('data', function(data) {
    chunkedResponse.push(data);
  })
  .on('end', function() {
    res.send(chunkedResponse.join(''));
  })
  .on('error', function(err) {
    res.send('error, yo.');
  });
```

I hear you like chunks?

> Templates may also be streamed. dust.stream returns a handler very similar to a Node EventEmitter:

Push the response onto an array. When we've recieved an 'end' signal, wrap everything up and send it to the client.

This can be useful if you need to do something special with the content before it's sent to the user. Caching?

## Traverson
> A well constructed client then only needs to know the URI of the root resource and can find its way from there to every other resource by following links with well defined relations

[Traverson](https://blog.codecentric.de/en/2013/11/traverson/)
[Traverson-Git](https://github.com/basti1302/traverson)

Examples
* https://api.github.com/

```javascript
var traverson = require('traverson')
var api = traverson.json.from('http://api.io')

api.newRequest()
   .follow('link_to', 'resource')
   .getResource(function(error, document) {
  if (error) {
    console.error('No luck :-)')
  } else {
    console.log('We have followed the path and reached our destination.')
    console.log(JSON.stringify(document))
  }
});
```
