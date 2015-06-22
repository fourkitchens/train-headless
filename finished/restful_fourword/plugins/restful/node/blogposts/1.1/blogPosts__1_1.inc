<?php
$plugin = array(
  'label' => t('Blog Posts'),
  'resource' => 'blogposts',
  'name' => 'blogPosts__1_1',
  'entity_type' => 'node',
  'bundle' => 'article',
  'description' => t('Fourword blog posts using view modes'),
  'class' => 'RestfulEntityBaseNode',
  'authentication_types' => TRUE,
  'authentication_optional' => TRUE,
  'minor_version' => 1,
  'view_mode' => array(
    'name' => 'default',
    'field_map' => array(
      'body' => 'body',
      'field_tags' => 'tags',
      'field_image' => 'image',
    ),
  ),
);
