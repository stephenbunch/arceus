require( 'babel-register' );
require( 'babel-polyfill' );

var gulp = require( 'gulp' );
var arceus = require( './src' );

gulp.task( 'make', function() {
  return arceus.js.babelify({
    source: 'src/**/*',
    outdir: 'dist'
  });
});

gulp.task( 'clean', function() {
  return arceus.util.deleteAsync( 'dist' );
});

gulp.task( 'watch', function() {
  arceus.js.babelifyWatch({
    source: 'src/**/*',
    outdir: 'dist',
    callback() {
      arceus.util.log( 'build succeeded' );
    }
  });
});

gulp.task( 'default', function() {
  return arceus.util.gulpAsync( gulp, 'clean', 'make', 'test' );
});

gulp.task( 'test', function() {
  return arceus.test.nodeAsync( 'test/**/*.spec.js' );
});
