var gulp = require('gulp');
//var del = require('del');
//var mkdirp = require('mkdirp');
//var concat = require('gulp-concat');
//var uglify = require('gulp-uglify');
//var maps = require('gulp-sourcemaps');
var gulpSequence = require('gulp-sequence');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var babelify = require('babelify');
var aliasify = require('aliasify');


gulp.task('build', gulpSequence(
    'build'
));

gulp.task('build', function() {
  var bundler = browserify('./jquery.flot.intensitygraph-plugin.js', {
          debug: true,
          bundleExternal: false,
          external: [
              // These will be required() from a different bundle
          ],
          require: [
              // Nothing is actually available via require()
              // Only the side effects caused in the browser.js file will happen
          ]
      })
      .transform(babelify, {
          presets: ['es2015']
      })
      .on('file', function (file, id, parent) {
          console.log(file);
          console.log(id);
          console.log(parent);
      })
      .transform(aliasify);
      //.transform('aliasify');

  return bundler.bundle()
    .pipe(source('jquery.flot.intensitygraph.js'))
    .pipe(gulp.dest('.'));
});
