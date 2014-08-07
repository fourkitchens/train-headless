# 1. Introduction to Headless Drupal

## When to go Headless
- Speed of development
	- Not always initially faster. A headless approach to developing a Drupal site can lead to gains later in a project.
- Seperation of teams/resources
	- Dedicated teams for building 'Drupal' resources, and dedicated teams for building rendering/presentation resources.
    - Lack of technical debt on teams. Focusing on a single set of tasks.
- Same data, lots of different consumers
	- Building one backend that will be consumed with many different systems.
    - Mention TSWJF?

## Architecture Patterns
- Node.JS
	- You build the webserver.
    - You create routes and controllers and pick your rendering engine.
    - Multiple options for frameworks. Express, Sails, Flatiron.

### MVC & The Real World

![](http://itgcom.wpengine.netdna-cdn.com/wp-content/uploads3/2013/03/The-Real-World-Los-Angeles.jpg)

The **Model** represents the data, and does nothing else. The model does NOT depend on the controller or the view. The **View** displays the model data, and sends user actions to the controller. The **Controller** provides model data to the view, and interprets user actions such as button clicks. The controller depends on the view and the model.

Drupal is your model. The services you create expose your data. Potentially some preprocessing can happen on that data before it's exposed. The controller handles the interaction between the view, what your user sees, and the exposed data model from Drupal. 

1. The user request a page.
2. The controller recieves a rest for a page. Any modifications to he request happen here. The response of that request is additionally processed here. 
3. The controller then returns the data to the view for rendering.
        
Your express application is broken up into three main compenents,  your routes, controllers and views. Routes let your users interact with your application and pass data to your controllers. The controllers recieve data from the routes, make requests to your data model and render the response.

Technically the controller itself isn't doing the rendering, but calling a 'render' function which should accept a template, and the data from the model. 

In Express (similar to other frameworks), you'd do something like this, 
	
    res.render('index', {response : drupal_json});

## Real world Examples

Lets find some of these. Probably HeadlessWord/Fourword, TSWJF.
