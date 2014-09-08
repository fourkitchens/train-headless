<?php

use Level3\Resource\Link;
use Level3\Resource\Resource;
use Level3\Resource\Format\Writer\HAL;

class ServicesHALFormatter implements ServicesFormatterInterface {
  public function render($data) {
    // json_encode doesn't give valid json with data that isn't an array/object.
    if (gettype($data) == 'object' &&  get_class($data) == 'Level3\Resource\Resource') {
      $writer = new HAL\JsonWriter(true);

      return $writer->execute($data);
    }
    else {
      json_encode($data);
    }

  }
}

class ServicesParserHAL implements ServicesParserInterface {
  public function parse(ServicesContextInterface $context) {
    return json_decode($context->getRequestBody(), TRUE);
  }
}
