<?php
/**
 * @file
 * Migrations for the blog posts.
 */

class BlogPostMigration extends XMLMigration {
  /**
   * Constructor.
   */
  public function __construct() {
    parent::__construct();
    $this->description = t('Blog Post import.');

    // Map the source unique identifier for progress, rollbacks.
    $this->map = new MigrateSQLMap($this->machineName,
      array(
        'nid' => array(
          'type' => 'varchar',
          'not null' => TRUE,
          'length' => 255,
          'description' => 'Legacy NID',
        ),
      ),
      MigrateDestinationTerm::getKeySchema()
    );

    // Source fields.
    $fields = array(
      'title' => t('The Title'),
      'body' => t('The Body'),
    );

    $xml_folder = DRUPAL_ROOT . '/sites/default/files/migration/blog';
    $files = file_scan_directory($xml_folder, '/\.xml$/');
    $items_url = array_keys($files);

    $item_xpath = '/node_export/node';
    $item_id_xpath = 'nid';

    $source_options = array(
      'cache_counts' => TRUE,
    );

    $this->source = new MigrateSourceXML($items_url, $item_xpath, $item_id_xpath, $fields, $source_options);
    $this->destination = new MigrateDestinationNode('article');

    $this->addFieldMapping('title', 'title')
      ->xpath('title');
    $this->addFieldMapping('body', 'body')
      ->xpath('body/und/n0/value');
  }
}
