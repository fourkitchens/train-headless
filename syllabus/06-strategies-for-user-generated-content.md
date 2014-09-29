# 6. Strategies for User Generated Content

So far we've talked exclusively about how to get content out of Drupal. In this last section we'll talk about how to get content into Drupal.

## Problems with large scale content decoupled Content Creation with Drupal

* Performance - Can't cache things, but the performance hurdles are much lower than with a traditional Drupal site.
* Validation - Drupal's validation is stuck in the form layer. All Validation needs to be implemented again and possibly twice if you want to have client and server validation, and you can't go without validation in the server layer.
* Authentication - With a node.js frontend User sessions need to be passed through to the Drupal site.

## Easy solution.

Use [Disqus](https://disqus.com/).

I'm not kidding. It's a great service and provides a great platform for commenting, and it's 100% frontend so you don't run into performance issues.

## Older example of how we did it.

[Drupal Poetry](http://drupalpoetry.com/drupo/)

[A presentation about how Drupal Poetry was architechted.](http://fourkitchens.github.io/badcamp-node/#/14)

## How we are going do it in the future.

Using [Restful Module](https://github.com/Gizra/restful) from Gizra.

A great little example [blog post](http://www.gizra.com/content/restful-angular-forms/).
