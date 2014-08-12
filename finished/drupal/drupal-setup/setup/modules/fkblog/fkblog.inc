<?php

/**
 * Callback for retrieving node resources.
 *
 * @param int $id
 * @return object
 */
function _blogpost_retrieve($id) {
  return blogpost_get_id($id);
}

/**
 * Access callback for the node resource.
 *
 * @param string $op
 *  The operation that's going to be performed.
 * @param array $args
 *  The arguments that will be passed to the callback.
 * @return bool
 *  Whether access is given or not.
 */
function _blogpost_access($op, $args) {
  global $user;
  $access = FALSE;
  switch ($op) {
    case 'view':
      $access = user_access('view any blog post');
      break;
  }
  return $access;
}