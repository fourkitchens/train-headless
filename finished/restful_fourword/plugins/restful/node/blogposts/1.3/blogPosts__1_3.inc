<?php
$plugin = array(
  'label' => t('Blog Posts'),
  'resource' => 'blogposts',
  'name' => 'blogPosts__1_3',
  'entity_type' => 'node',
  'bundle' => 'article',
  'description' => t('Fourword blog posts using view modes'),
  'class' => 'RestfulFourwordBlogPostsResource__1_3',
  'authentication_types' => TRUE,
  'authentication_optional' => TRUE,
  'minor_version' => 3,
);
