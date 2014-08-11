<?php
/**
 * @file
 * Describe the Blog migration to the Migrate API.
 */

/**
 * Implements hook_migrate_api().
 */
function fkblog_migrate_api() {
  $api = array(
    'api' => 2,
    'migrations' => array(
      'BlogPost' => array(
        'class_name' => 'BlogPostMigration',
      ),
    ),
  );
  return $api;
}
