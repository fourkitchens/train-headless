# 2.5 Headless A-ha's

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
