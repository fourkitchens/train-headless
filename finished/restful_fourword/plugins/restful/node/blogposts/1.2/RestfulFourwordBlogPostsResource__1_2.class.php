<?php

/**
 * @file
 * Contains RestfulExampleArticlesResource__1_2.
 */

class RestfulFourwordBlogPostsResource__1_2 extends RestfulEntityBaseNode {
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['body'] = array(
      'property' => 'body',
      'sub_property' => 'value',
    );

    return $public_fields;
  }
}
