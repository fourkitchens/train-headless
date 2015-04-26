# 4. Headless A-ha's & Reference implementation introduction

## Headless A-ha's

- API _only_ sites are very different than _websites_, in fact a good API driven site is very focused and not easily aligned with the ad-hoc WYSIWYG Drupal mind set of sticking blocks or widgets any which way and having that show up. No one out there has really tackled the idea of page contexts, the additional information you would need in addition to a single endpoint payload to make an API driven page just as arbitrary as a Drupal page. This all goes to the question, 
> **“Is an API driven site right for my business?”**

- Getting an Apiary or _apiary-like_ mock API provider up as soon as possible lets teams get active asynchronously faster and then you have shippable components on the API, back end, and front-end available.

- Dustjs can’t parse hal+json because of the `:` in many of the keys. We sanitized the data to change `:` to `_`
> [Github Issue](https://github.com/linkedin/dustjs/issues/229)
> [sanitize.js](https://github.com/fourkitchens/headless-framework/blob/master/lib/processors/sanitize.js)

- The restful Drupal module requires keyed objects or associative arrays in URL parameters in this syntax: `filter[type]=7&filter[created]=1425404668`. The [RFC 6570 spec](http://tools.ietf.org/html/rfc6570) does not allow for this syntax. Filtering is tough. Being able to pass the filter information to the API is tricky. For example, `/posts/:type/:created/prev-next` is a route, but what happens if we don’t want to filter by type?

- Use Plural nouns for endpoints both listings and single items.
> `api/people` & `api/people/13`

- Unless you have a endpoint for it, it **ain’t** coming out of the API.

- Don't forget basic things you get for free from _Apache, Nginx, Drupal_,
  - Handle 404’s -- you probably need to design a 404 page depending on your server.
  - How are you going to handle redirects?
  - How are you going to handle URL paths, what technology is involved in creating the routes and cleaning them.
  
- Cache Clearing is hard.

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


