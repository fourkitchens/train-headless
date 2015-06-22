<?php

$plugin = array(
  'label' => t('tags'),
  'resource' => 'tags',
  'name' => 'tags__1_0',
  'entity_type' => 'taxonomy_term',
  'bundle' => 'tags',
  'description' => t('Export the "Tags" taxonomy term.'),
  'class' => 'RestfulEntityTaxonomyTermTags',
  'authentication_types' => TRUE,
  'authentication_optional' => TRUE,
);
