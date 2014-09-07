/**
 * @file
 *   Gulpfile that creates rendered GulpJS templates.
 */
'use strict';

// Declare dependencies
var gulp = require('gulp');
var dust = require('gulp-dust');
var wrap = require('gulp-wrap');

// DustJS
gulp.task('dust', function () {
  return gulp.src('./templates/**/*.dust')
    .pipe(dust({
      'preserveWhitespace' : true
    }))
    .pipe(wrap({ src: './_src/dust.txt'}))
    .pipe(gulp.dest('dist'));
});

// Default: Watch
gulp.task('default', ['dust']);
