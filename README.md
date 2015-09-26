# Arceus

![Arceus](http://cdn.bulbagarden.net/upload/thumb/f/fc/493Arceus.png/500px-493Arceus.png)

I got tired of writing the same gulp code for all my projects, so I decided to create a package that wraps some of the common libraries (browserify, babel, browser-sync, etc.) with a simpler API.

## Sample
```js
var gulp = require('gulp');
var arceus = require('arceus');

var jsConfig = {
  entry: 'src/client/index.js',
  outfile: 'public/app.js'
};

gulp.task('make:js', function() {
  return arceus.js.bundle(jsConfig);
});

gulp.task('watch', function() {
  return arceus.js.watchBundleAsync(jsConfig, function() {
    console.log('build succeeded');
  }).then(function() {
    arceus.util.gulpWatch(gulp, 'src/css/**', 'make:css');
    arceus.util.gulpWatch(gulp, 'src/assets/**/*', 'make:assets');
  });
});

gulp.task('make:css', function() {
  var stylus = require('gulp-stylus');
  return arceus.css.bundle({
    entry: 'src/css/index.styl',
    outfile: 'public/app.css',
    transform: stylus()
  });
});

gulp.task('make:assets', function() {
  return gulp.src('src/assets/**/*').pipe(gulp.dest('public/assets'));
});

gulp.task('make', function() {
  return arceus.util.gulpAsync(gulp, 'clean', ['make:js', 'make:css', 'make:assets']);
});

gulp.task('clean', function() {
  return arceus.util.deleteAsync('public');
});

gulp.task('default', function() {
  return arceus.util.gulpAsync(gulp, 'clean', 'make', 'watch');
});
```
