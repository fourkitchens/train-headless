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
  * The module we are using
  * Oldest module
  * Good architecture for setting up servers
  * Handles different servers becides REST
  * Horrible default Entity endpoints
  * Custom endpoint creation is a little clunky.
* RESTws
  * Not a bad option overall
  * Custom endpoint creation is OK
  * Less robust server implementation
  * No default endpoints
* RESTful
  * Most exciting
  * Likely what we'll be teaching the class next year
  * Only reason we are not is that we don't have an implementation in production.
  * Very good API for creating endpoints
  * Very well written.
  * No default endpoints

## Install and configure Services
1. Install Module
2. Enable services, REST Server
``drush en -y services rest_server``
3. Create a server
``http://localhost:8081/admin/structure/services``
4. Click Add
  * Name: 'API'
  * Server: 'REST'
  * Path to Endpoint: 'api'
  * Authenticaion: don't check anything
5. Test with built in endpoint
  1. click resources
  2. Expand 'Node'
  3. Check retrieve under CRUD Operations
6. Disable the default endpoint.

## Create a simple custom endpoint
1. TODO: How to get the boilder plate
2. TODO: Have students create the Author instead.
2. Create the endpoint
```PHP
$node = node_load($id);
$wrapper = entity_metadata_wrapper('node', $node);
$sensible = new stdClass();
$sensible->nid = $wrapper->getIdentifier();
$sensible->author = $wrapper->author->name->value();
$sensible->title = $wrapper->title->value();
$sensible->body = $wrapper->body->value->value();
return $sensible;
```
3. **Silver** Create an endpoint for Tags
4. **Gold** Create an endpoint for images

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
