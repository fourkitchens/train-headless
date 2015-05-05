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

#### 4. Declare an endpoint for blog posts. `my_restful/plugins/restful/node/blogposts/1.0/my_blogposts__1_0.inc`
```PHP
$plugin = array(
  'label' => t('Blog Posts'),
  'resource' => 'my_blogposts',
  'name' => 'my_blogPosts__1_0',
  'entity_type' => 'node',
  'bundle' => 'blog_post',
  'description' => t('First blog posts'),
  'class' => 'RestfulFourwordBlogPostsResource__1_0',
  'authentication_types' => TRUE,
  'authentication_optional' => TRUE,
  'minor_version' => 0,
);
```

The resource key determines the root URL of the resource. The name key must match the filename of the plugin: in this case, the name is my_blogposts, and therefore, the filename is my_blogposts.inc.

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

#### 5. Create your first endpoint.

```PHP
<?php

/**
 * @file
 * Contains RestfulExampleArticlesResource__1_6.
 */

class RestfulFourwordBlogPostsResource__1_0 extends RestfulEntityBaseNode {
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
This is all the code you need to create your first endpoint. Your first endpoint will now be available at `/api/blogposts`.  

It does the following:
* This extends the class `RestfulEntityBaseNode`. This is a convience class that makes working with entities easier. If you wanted to create an endpoint that exposed something else you would use a different base class.
* Creates a public function `publicFieldsInfo()`.
* In that function creates a variable called `$public_fields` populated with the parent's `publicFieldsInfo()`
* Adds a new field called body and sets the body to the value of the nodes body field.

#### All the stuff you can now do:
* See a list of all the blog posts and follow links to the next ones.
* Get a specific blog post: `api/blogposts/29,143`
* Limit the fields returned using the *fields=* query parameter `api/blogposts/29?fields=body`
* Filter the API using the *filter[lable]=* query parameter.
* More info on consuming the API is in (this file)[https://github.com/RESTful-Drupal/restful/blob/7.x-1.x/docs/api_url.md]

#### Error Handling
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

#### Bonus
* _Silver_: Create version 1.1 of this endpoint and add a new property called series using the `field_blog_series_term_tree` property.
* _Gold_: Create a new endpoint that exposes the sites variables see (this example)[https://github.com/RESTful-Drupal/restful/blob/7.x-1.x/modules/restful_example/plugins/restful/variable/1.0/]


## Create a HAL custom endpoint
### Why HAL?
* Provides a 'grammer' for your API
* Makes it easier for clients to work with it
* Provides a sensible set of limitations to keep you sane
* Drupal 8 will use HAL for it's REST API

### What is HAL?
* JSON with some standard ways to represent stuff
* Links to other resources
* Embeded resources

1. Enable the services_HAL module
2. Install libraries ```drush composer-manager install```
3. USE the libraries
4. Assign the uid, name and body using addData()
5. Create a ??? link
6. Embed profile image
7. **Silver** Create an endpoint for the tags
