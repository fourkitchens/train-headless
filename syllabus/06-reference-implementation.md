# 4. Reference implementation introduction

## Outline

- Reference Implementation Introduction
- Routing
- Rendering

## Reference Implementation Introduction

```
███████╗ █████╗ ██╗   ██╗ ██████╗██╗███████╗██████╗
██╔════╝██╔══██╗██║   ██║██╔════╝██║██╔════╝██╔══██╗
███████╗███████║██║   ██║██║     ██║█████╗  ██████╔╝
╚════██║██╔══██║██║   ██║██║     ██║██╔══╝  ██╔══██╗
███████║██║  ██║╚██████╔╝╚██████╗██║███████╗██║  ██║
╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝╚══════╝╚═╝  ╚═╝
```

> [SAUCIER](https://github.com/fourkitchens/saucier)

### Why?

- Place to explore ideas about this concept.
- Consistent starting point.
- Solve hard problems once, _maybe_. 
- Maintenance

## Let's Make Something

- Create an `./config/env.json` file. A template is located at, `./config/_env.json`
- Ensure the `local` environment in `./config/env.json` is populated with
  - The API endpoint you want to operate against.
  - The Redis instance you want to get/set information from.
- Create an `./config/_secrets.json` file. A template is located at, `./config/secrets.json`.
- Populate the `./config/secrets.json` file.

```json
{
  "wwwSecret": "1wo7kwewmi",
  "apiSecret": "48eusaif6r",
  "routeCacheSecret": "pb89yxy9zfr"
}
```

### Routing

Breakup your route definitions into logical defaults. Something to remember is that routes are processed in order. Additionally all routes attached in `app.js` are processed after anything attached in `headless.js`.

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

> [web.js](https://github.com/fourkitchens/saucier/blob/master/routes/web.js)

Routes for listing pages, collections if items, are identified with `routeSection()`. Currently the caching of data from listing pages is _not_ supported, but should be upcoming.

```javascript
/**
 * Posts
 */
app.routeSection('/posts', 'content/posts/posts.dust', {});
```

In it's most basic form, `routeSection`, and `routeItem` are wrappers around the basic `get` method from Express. However here we have the option to attach some additional _options_.

The first parameter is always the route to match, this can be a regex. The second parameter is the template that will be used to render the final response. Finally, the `options` object.

There are a few optional keys, but the required one is the `resource` key. This is the internal API path. This is an array, and accepts unlimited values. Each request will be processed asynchronously, and their values returned, keyed by their name. 

We'll refer to this as _multi-get_ in the future. 

```javascript
/**
 * Posts
 */
app.routeSection('/posts', 'content/posts/posts.dust', {
  resource: ['blogposts'],
  processors: []
});
```

Another additional route option is, `passQuery: true`. This forwards all query parameters from the initial request to the back-end. Additionally you may want to create more routes for preforming actions on posts.

```javascript
app.routeSection('/posts', 'content/posts/posts.dust', {
  resource: ['posts?range=25'],
  passQuery: true
});
app.routeSection('/posts/:type', 'content/posts/posts.dust', {
  resource: ['posts?filter[types]={nid}&range=25'],
  passQuery: true
});
app.routeItem('/posts/:type/:title', 'content/posts/post.dust', {
  resource: ['posts/{nid}']
});
```

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
var handleGet         = function (route, template, options) {
   /**
    * Handle GET responses in a generic way
    * @private
    * @param {(string|regexp)} route The route to match.
    * @param {string} template Template name that will be used to format the response
    * @param {object} options An object that configures the Controller instance
    * @return {object} res The response object
    */
  app.get(route, function (req, res, next) {
    var path = req.path;
    path += Object.keys(req.query).length !== 0 ? helpers.serialize(req.query) : '';
    debug('PATH: ' + path);
    debug('ROUTE TYPE: ' + options.type);
    Q(helpers.getConfig(options, config, req, template, templateEngine, keepAliveAgent))
      .then(cache.get)
      .then(api.get)
      .then(cache.set)
      .then(processData.prepare)
      .then(render.parse)
      .then(function (response) {
        return res
                .set({
                  'Cache-Control': 'max-age=86400',
                  'Expires': new Date(Date.now() + 86400000).toUTCString()
                })
                .send(response);
      })
      .fail(function (options) {
        return next(options);
      });
    });
};
```

> [headless.js](https://github.com/fourkitchens/saucier/blob/master/lib/headless.js)

- Implemented custom methods for handling different types of requests. 
  - `routeMulti`, `routeSection`, `routeItem`
  - Each handler is an alias for `handleGet` and can attach additional options.
- Promises.
- `.then()`
- Handlers
  - Cache
  - API
  - Rendering

### Templates and Rendering

> [DustJS](http://linkedin.github.io/dustjs/)

Dust is mostly just `HTML`. Templates can be used for rendering in your **application**, and in the **browser**. Browser templates can be served from a CDN, or other high-performance network. Template files can also be cached in the users browser cache; all you need to send is updated JSON for rendering.

- Async & streaming operation
- Browser/node compatibility
- Extended Mustache/ctemplate syntax
- Clean, low-level API
- High performance

The following examples use some syntax you might not be familiar with, don't worry about that for now. For example, your template code,

```html
{title}
<ul>
{#names}
  <li>{name}</li>{~n}
{/names}
</ul>
```

and, your JSON data,

```json
{
 "title": "Famous People",
 "names" : [{ "name": "Larry" },{ "name": "Curly" },{ "name": "Moe" }]
}
```

gives you something like, 

```html
Famous People
<ul>
  <li>Larry</li>
  <li>Curly</li>
  <li>Moe</li>
</ul>
```

There is a base template at `workspace/node/headless-framework/_src/templates/base_template.dust`. This should be your wrapper. If you're familiar with Sass, then the modularity of Dust will make sense.

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

You may have noticed, `.then(render.parse)`. This is where the actual JSON is folded onto the template you just created. This is pretty simple, `options.engine.render` is Dust. We're not dependent on Dust, as long as your template engine has `render` function and returns HTML.

- Last step
- Any engine that supports `.render()` could be plugged in.
  - No dependencies on `DustJS`
- Only return HTML.

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

> [render.js](https://github.com/fourkitchens/saucier/blob/master/lib/render.js)
