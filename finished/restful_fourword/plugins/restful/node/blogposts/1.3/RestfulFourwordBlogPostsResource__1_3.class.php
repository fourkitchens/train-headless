<?php

/**
 * @file
 * Contains RestfulExampleArticlesResource__1_3.
 */

class RestfulFourwordBlogPostsResource__1_3 extends RestfulEntityBaseNode {
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['body'] = array(
      'property' => 'body',
      'sub_property' => 'value',
    );

    $public_fields['tags'] = array(
      'property' => 'field_tags',
      'resource' => array(
        'tags' => 'tags',
      ),
    );

    return $public_fields;
  }
}
