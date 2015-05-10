# 2. Drupal Services

## Drupal Web Services
### Outline
* Module Options
  * Why Restful
* Install & configure Restful
* Create Endpoints
  * Single node endpoint
  * Node collection endpoint
    * Filtering content
  * Referenced content (node author)
  * Handling Media
  * Queued Content
* Hypermedia API Design in practice
  * Apiary for mocking & Docs.
  * Mocking in Drupal directly.
* Drupal Overview
### Different Module Options
* Services
  * Oldest module
  * Good architecture for setting up servers
  * Handles different servers becides REST
  * Horrible default Entity endpoints
  * Custom endpoint creation is not intuitive and hard to work with
* RESTws
  * Not a bad option overall
  * Custom endpoint creation is OK
  * Less robust server implementation
  * No default endpoints
* RESTful
  * The module we are using for this class
  * Very good API for creating endpoints
  * Very well written.
  * No default endpoints
  * Designed from the ground up to create beautiful APIs

## Intro to Restful

> This module allows Drupal to be operated via RESTful HTTP requests, using best practices for security, performance, and usability.

  * All endpoints are explicitly created. The module does nothing by default.
    * This allows for clean output and keeps *Drupalisms* from leaking out into your API
  * Versioning is core to how endpoints are built
  * Endpoints are built around bundles, not entity types, making it easy to expose certain endpoints, but not others.
  * Configurable output formats allowing for output in JSON or XML
  * Object oriented architecture that makes it easy to created endpoints and reuse code.
  * Very good test coverage in the module.

## Structure of our content

The content we'll be working with is populated with posts from the four kitchens blog. Below is a list of the fields that we'll be working with for easier reference. The login to your Database is admin:admin.

  | Field Label | Machine Name | Field Type | Comments    |
  | ----------- | ------------ | ---------- | ----------- |
  | Lead image  | field_lead_image | Image |              |
  | Body        | body         | Long Text |              |
  | Inline Images | field_inline_image | Image |          |  
  | Files       | field_blog_files | File |               |
  | Blog Categories | field_blog_categories_term_tree | Term reference | |
  | Blog Series | field_blog_series_term_tree | Term reference | | |

## Install and Configure Restful
The module is already installed. The only dependency is the [Entity API](https://drupal.org/project/entity) module. There is one [patch](https://www.drupal.org/node/2086225#comment-9627407)
 to the Entity API module required.

Once the module is installed there is no exposed admin page. You need to create your own module that declares a Restful plugin to use the module.

Lets do that now!

## Create Endpoints
### Create a module
#### 1. Create a folder called fkblog_restful in the `sites/all/modules/custom` folder.
#### 2. Create the .info file. `my_restful/my_restful.info`
```php
name = My First RESTful API
description = Custom RESTful endpoints for my blog.
core = 7.x
dependencies[] = restful
```
### 3. Declare the plugin in the .module file `my_restful/my_restful.module`
```
/**
 * Implements hook_ctools_plugin_directory().
 */
 function my_restful_ctools_plugin_directory($module, $plugin) {
   if ($module == 'restful') {
     return 'plugins/' . $plugin;
   }
 }
```

### 4. Declare an endpoint for blog posts. `my_restful/plugins/restful/node/blogposts/1.0/my_blogposts__1_0.inc`
```PHP
$plugin = array(
  'label' => t('Blog Posts'),
  'resource' => 'blogposts',
  'name' => 'blogPosts__1_0',
  'entity_type' => 'node',
  'bundle' => 'blog_post',
  'description' => t('Fourword blog posts using view modes'),
  'class' => 'RestfulEntityBaseNode',
  'authentication_types' => TRUE,
  'authentication_optional' => TRUE,
);
```

Copy and paste the boiler plate above, and add a key called view_mode after the `authentication_optional` key with an array that has the following

| key       | value                               |
| --------- | ----------------------------------- |
| `name`      |  `default`                        |
| `field_map` | array with key and value `body`   |

The resource key determines the root URL of the resource. The name key must match the filename of the plugin: in this case, the name is my_blogposts, and therefore, the filename is my_blogposts.inc.

This endpoint is created using the default view mode, and exposes any fields that are listed in the `field_map` array. *Note:* Fields must be visible in the view mode for them to show up.

Lets talk about the different parts of the array.
* `label` - The label of the plugin.
* `resource` - Name of the *resource*, must match the filename of the plugin.
* `name` - Machine name of the plugin.
* `entity_type` - Type of Entity this resource will expose.
* `bundle` - Name of the bundle this resource will expose.
* `description` - Longer description of the plugin.
* `class` - Class file that will declare the plugin.
* `authentication_types` - What type of authentication this plugin will use.
* `authentication_optional` - Determines if the authentication is required.
* `minor_version` - Minor version of the API that this plugin will be exposed under.
* `view_mode` - Array with info about the view mode to use for this endpoint.

### 4.1 All the stuff you can do now!

RESTful comes with a bunch of out of the box functionality for any resource that you create. Including

* See a paginated list of blog posts, and use hyper links to go to different pages: `api/blogposts`
* Get a specific blog post: `api/blogposts/29,143`
* Limit the fields returned using the *fields=* query parameter `api/blogposts/29?fields=body`
* Filter the API using the *filter[lable]=* query parameter.
* More info on consuming the API is in (this file)[https://github.com/RESTful-Drupal/restful/blob/7.x-1.x/docs/api_url.md]

### 4.2 Error Handling
If an error occurs when operating the REST endpoint via URL, A valid JSON object
 with ``code``, ``message`` and ``description`` would be returned.

The RESTful module adheres to the [Problem Details for HTTP
APIs](http://tools.ietf.org/html/draft-nottingham-http-problem-06) draft to
improve DX when dealing with HTTP API errors. Download and enable the [Advanced
Help](https://drupal.org/project/advanced_help) module for more information
about the errors.

For example, trying to sort a list by an invalid key

```shell
curl https://example.com/api/v1/articles?sort=wrong_key
```

Will result with an HTTP code 400, and the following JSON:

```javascript
{
  'type' => 'http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.4.1',
  'title' => 'The sort wrong_key is not allowed for this path.',
  'status' => 400,
  'detail' => 'Bad Request.',
}
```

### 4.3 Add categories.

Add a new key to the `view_modes` key that is `field_blog_categories_term_tree` with a value of categories.

This isn't output isn't great. The HTML surrounding the categories is going to make life hard for our API consumers. We could install (Display Suite)[https://www.drupal.org/project/ds], but even with those tools we are going to hit a wall sometime or another. Lets try creating a more custom endpoint instead.

### 5.0 Versioning your API.

Lets create a new version of our API. Once your API is published to the world it's important to be diligent about versioning. There is nothing worse than having your site broken by an API that changed. OK, having your site broken on a _Friday_ by a broken API is worse.

Luckily RESTful is built from the ground up to facilitate easy versioning.

* Copy the 1.0 folder to a 1.1 folder.
* Rename the `blogPosts__1_0.inc` file to `blogPosts__1_1.inc`
* Add a `minor_version` key with a value of 1 to the plugin definition.
* Clear the cache `drush cc all`
* Visit the new version `/api/v1.1/blogposts`



#### Accessing different API versions in RESTful.

You can access different versions of the API using two different methods.
1. Using the URL. Simply replace the `v1.1` with `v1.0`.
2. Using a header.
```bash
curl http://mirzu.fourword.webchefs.org:8080/api/v1.0/blogposts \
-H "X-API-Version: v1.0"
```
The URL is useful for humans, but the header is useful for building API clients.

### 5.1 Create a custom endpoint.

```PHP
<?php

/**
 * @file
 * Contains RestfulExampleArticlesResource__1_1.
 */

class RestfulFourwordBlogPostsResource__1_1 extends RestfulEntityBaseNode {
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['body'] = array(
      'property' => 'body',
      'sub_property' => 'value',
    );

    return $public_fields;
  }
}
```

This is all the code you need to create your first endpoint. Your first endpoint will now be available at `/api/v1.1/blogposts`.  

It does the following:
* This extends the class `RestfulEntityBaseNode`. This is a convience class that makes working with entities easier. If you wanted to create an endpoint that exposed something else you would use a different base class.
* Creates a public function `publicFieldsInfo()`.
* In that function creates a variable called `$public_fields` populated with the parent's `publicFieldsInfo()`
* Adds a new field called body and sets the body to the value of the nodes body field.

### 5.2 Add categories to the endpoint.

The same technique can be used to add any text or numerical fields as properties to your API, but what if you want to add links to other resources? For example lets say we created and endpoint that is for categories, and wanted to link to all the categories that each blog post has?

Hey look at that someone created a categories endpoint for us: `/api/categories`. Open up the folder and take quick look, we didn't need to do anything besides declare the class.

#### Start by creating a new API endpoint version.

* Copy the 1.0 folder to a 1.1 folder.
* Rename the `blogPosts__1_1.inc` file to `blogPosts__1_2.inc`
* Add a `minor_version` key with a value of 1 to the plugin definition.
* Copy the class file, rename it to `RestfulFourwordBlogPostsResource__1_2.class.php`, and update the plugin definition in  `blogPosts__1_2.inc` with the new name.
* Update the class definition in `RestfulFourwordBlogPostsResource__1_2.class.php`
* Clear the cache `drush cc all`
* Visit the new version `/api/v1.2/blogposts`

#### Add the categories property.

Add the following after the body property. This will create a link to the blog categories which is a link to the `blog_categories` endpoint.

```
$public_fields['categories'] = array(
  'property' => 'field_blog_categories_term_tree',
  'resource' => array(
    'blog_categories' => 'categories',
  ),
);
```

#### Bonus
* _Silver_: Add a resource for the series by copying the categories endpoint and add a new property called series using the `field_blog_series_term_tree` property to link to it like categories.
* _Gold_: Create an endpoint that links to the user API resource who authored the blog post.
* _Platinum_: Create a new endpoint that exposes the sites variables see (this example)[https://github.com/RESTful-Drupal/restful/blob/7.x-1.x/modules/restful_example/plugins/restful/variable/1.0/]

### 5.2 Adding an image.

#### Our last API version.

Being the good API authors we are lets create the final version of our API.

* Copy the 1.2 folder to a 1.3 folder.
* Rename the `blogPosts__1_2.inc` file to `blogPosts__1_3.inc`
* Add a `minor_version` key with a value of 1 to the plugin definition.
* Copy the class file, rename it to `RestfulFourwordBlogPostsResource__1_3.class.php`, and update the plugin definition in  `blogPosts__1_3.inc` with the new name.
* Update the class definition in `RestfulFourwordBlogPostsResource__1_3.class.php`
* Clear the cache `drush cc all`
* Visit the new version `/api/v1.3/blogposts`


#### Add a property for the image.
```
$public_fields['lead_image'] = array(
  'property' => 'lead_image',
);
```

That works, but we are leaking lots of info our API consumers don't need, plus there isn't a simple link to the image. Lets fix that with a custom processor.

#### Add a process callback

RESTful gives us an easy way to process any callback.

Add the following method to our class.
```PHP
/**
 * Process callback, Remove Drupal specific items from the image array.
 *
 * @param array $value
 *   The image array.
 *
 * @return array
 *   A cleaned image array.
 */
protected function fourwordImageProcess($value) {

  return array(
    'id' => $value['fid'],
    'self' => file_create_url($value['uri']),
    'filemime' => $value['filemime'],
    'filesize' => $value['filesize'],
    'width' => $value['width'],
    'height' => $value['height'],
    'styles' => $value['image_styles'],
  );
}
```
The process function accepts a Drupal field output array, and should return an array of mapped keys and values.

We use this method on our resource by adding a `process_callbacks` array to the `lead_image` public_field. Add the following code below the `property` key.
```PHP
      'process_callbacks' => array(
        array($this, 'fourwordImageProcess'),
      ),
```

Finally there is a neat little function that will add image styles. Add the foll0wing after the `process_callbacks`.

```PHP
'image_styles' => array('thumbnail', 'medium', 'large'),
```

### 6 API Best practices.
Versioning isn't the only thing that makes for a good API. There has been a great deal written about this lately and here are some resources to get you started.

* [A musical presentation about API design here at Drupalcon](http://fourword.fourkitchens.com/article/api-design-musical-live-drupalcon-la)
* [A great blog post outlining a very pragmatic approach](http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api)
* [The best book on the subject](http://www.amazon.com/RESTful-Web-APIs-Leonard-Richardson-ebook/dp/B00F5BS966/ref=sr_1_1?s=digital-text&ie=UTF8&qid=1431186690&sr=1-1&keywords=rest+api)
* [In depth discussion of API versioning.](http://www.troyhunt.com/2014/02/your-api-versioning-is-wrong-which-is.html)
