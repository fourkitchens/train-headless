# 4. Reference implementation introduction



## Reference Implementation Introduction

```
██╗  ██╗██╗  ██╗    ██╗  ██╗███████╗ █████╗ ██████╗ ██╗     ███████╗███████╗███████╗
██║  ██║██║ ██╔╝    ██║  ██║██╔════╝██╔══██╗██╔══██╗██║     ██╔════╝██╔════╝██╔════╝
███████║█████╔╝     ███████║█████╗  ███████║██║  ██║██║     █████╗  ███████╗███████╗
╚════██║██╔═██╗     ██╔══██║██╔══╝  ██╔══██║██║  ██║██║     ██╔══╝  ╚════██║╚════██║
     ██║██║  ██╗    ██║  ██║███████╗██║  ██║██████╔╝███████╗███████╗███████║███████║
     ╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝╚══════╝╚══════╝
```

> [4K Headless](https://github.com/fourkitchens/headless-framework)

### Why?

- Place to explore ideas about this concept.
- Consistent starting point.
- Solve hard problems once, _maybe_. 
- Maintenance

### Routing

Breakup your route definitions into logical defaults. A thing to remember is that routes are processed in order. Additionally all routes attached in `app.js` are processed after anything attached in `headless.js`.

`routesWeb       = require('./routes/web')(headlessDrupal);`

```javascript
/**
 * Home
 */
app.routeMulti('/', 'content/home.dust', {
  resource: [
    'foo?bar=1',
    'foo?baz=3'
  ],
  processors: ['homepage', 'googleAnalytics']
});
```

> [web.js](https://github.com/fourkitchens/headless-framework/blob/master/routes/web.js#L5)

- Implemented custom methods for handling different types of requests. 
  - `routeMulti`, `routeSection`, `routeItem`
  - Each handler is an alias for `handleGet` and can attach additional options.
  
#### handleGet

```javascript
/**
 * Handle GET responses in a generic way
 * @private
 * @param {(string|regexp)} route The route to match.
 * @param {string} template Template name that will be used to format the response
 * @param {object} options An object that configures the Controller instance
 * @return {object} res The response object
 */
function handleGet(route, template, options) {
  app.get(route, function (req, res, next) {
    debug('PATH: ' + req.path);
    debug('ROUTE TYPE: ' + options.type);

    Q(helpers.getConfig(options, config, req, template, templateEngine))
      .then(cache.get)
      .then(api.get)
      .then(cache.set)
      .then(processData.prepare)
      .then(render.parse)
      .then(function (response) {
        return res
                .set({
                  'Cache-Control': 'public, max-age=345600',
                  'Expires': new Date(Date.now() + 345600000).toUTCString()
                })
                .send(response);

      })
      .fail(function (options) {
        return next(options);
      });
  });
}
```

> [headless.js](https://github.com/fourkitchens/headless-framework/blob/master/lib/headless.js#L42)

- Promises.
- `.then()`
- Handlers
  - Cache
  - API
  - Rendering

#### _Posts_ Routes

Create a series of routes for _getting_ posts. 

```javascript
app.routeSection('/posts', 'content/posts/posts.dust', {
  resource: ['posts?range=25'],
  passQuery: true
});
app.routeItem('/posts/:type', 'content/posts/posts.dust', {
  resource: ['posts?filter[types]={nid}&range=25'],
  passQuery: true
});
app.routeItem('/posts/:type/:title', 'content/posts/post.dust', {
  resource: ['posts/{nid}']
});
```

### Rendering

> [DustJS](http://linkedin.github.io/dustjs/)

DustJS templates can be used for rendering in your application, and in the browser. Browser templates can be served from a CDN, or other high-performance network. Template files can also be cached in the users browser cache; all you need to send is updated JSON for rendering. _Don't repeat yourself._ Templates can be comprised of partials; allowing reuse of markup.

- Async & streaming operation
- Browser/node compatibility
- Extended Mustache/ctemplate syntax
- Clean, low-level API
- High performance

> `.then(render.parse)`

```javascript
options.engine.render(options.template, data, function (error, html) {
  if (error) {
    debug(error);
    deferred.reject(helpers.createErrorResponse(500, [error]));
  }
  else {
    debug(options.template);
    deferred.resolve(html);
  }
});
```

> [render.js](https://github.com/fourkitchens/headless-framework/blob/master/lib/render.js#L21)

- Last step
- Any engine that supports `.render()` could be plugged in.
  - No dependencies on `DustJS`
- Only return HTML.

#### Example

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

## Exercises

Update the `git` sub modules for this project, _there are a few_.

```shell
git submodule update
```

Additionally, add the following to `config/secrets.json`

```json
{
  "wwwSecret": "1wo7kwewmi",
  "apiSecret": "48eusaif6r",
  "routeCacheSecret": "pb89yxy9zfr"
}
```

#### Creating Routes

Blog posts is a listing route. Currently the caching of data from listing pages is _not_ supported, but should be upcoming.

```
/**
 + Posts
 */
app.routeSection('/posts', 'content/posts/posts.dust', {});
```

In it's most basic form, `routeSection`, and `routeItem` are wrappers around the basic `get` method from Express. However here we have the option to attach some additional _options_.

The first parameter is always the route to match, this can be a regex. The second parameter is the template that will be used to render the final response. Finally, the `options` object.

There are a few optional keys, but the required one is the `resource` key. This is the internal API path. This is an array, and accepts unlimited values. Each request will be processed asynchronously, and their values returned, keyed by their name. 

We'll refer to this as _multi-get_ in the future. 

```
/**
 + Posts
 */
app.routeSection('/posts', 'content/posts/posts.dust', {
  resource: ['blogposts'],
  processors: []
});
```

Another additional route option is, `passQuery: true`. This forwards all query parameters from the initial request to the back-end. 

#### Creating Templates

Dust is mostly just `HTML`.

There is a base template at `workspace/node/headless-framework/_src/templates/base_template.dust`.

This should be your wrapper. If you're familiar with Sass, then the modularity of Dust will make sense.

Each of your partials should be exporting a _block_, but to render that _block_ we need to let the parent partial know about it. 

> `{+pageContent/}`

The next template we'll create is the actual partial for rendering the blog posts. 

```dust
{>"base_template.dust" title="Posts"/}

{<pageContent}
  // your content
{/pageContent}
```

This let's dust know that we're returning a _block_ named `pageContent` and everything within the markup should be inserted into the body of the base template.

The syntax for loops in dust is pretty simplistic, and it's what you'll probably be using most of the time. This loops though the specific array of objects for our blog posts listing page. Within the loop, keys are available by their name, `{self}`, and sub keys are available with dot-notation.

```dust
{>"base_template.dust" title="Posts"/}

{<pageContent}
  {#_embedded.fk_blogposts}
    
  {/_embedded.fk_blogposts}
{/pageContent}
```

The final template with some additional `HTML` structure.

```dust
{>"base_template.dust" title="Posts"/}

{<pageContent}
  <div class="wrapper">
    <h1>posts</h1>
    {#_embedded.fk_blogposts}
      <h1>
        <a href="{self}">
        {label}
        </a>
      </h1>
      <p> Categories:
      {#categories}
        {label},
      {/categories}
      <p>
    {/_embedded.fk_blogposts}
    <a href="{_links.fk_next.href}">Next</a>
  </div>
{/pageContent}
```


