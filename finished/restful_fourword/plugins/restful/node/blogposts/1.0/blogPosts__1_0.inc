<?php
$plugin = array(
  'label' => t('Blog Posts'),
  'resource' => 'blogposts',
  'name' => 'blogPosts__1_0',
  'entity_type' => 'node',
  'bundle' => 'article',
  'description' => t('Fourword blog posts using view modes'),
  'class' => 'RestfulEntityBaseNode',
  'authentication_types' => TRUE,
  'authentication_optional' => TRUE,
  'view_mode' => array(
    'name' => 'default',
    'field_map' => array(
      'body' => 'body',
      'categories' => 'field_blog_categories_term_tree',
    ),
  ),
);
