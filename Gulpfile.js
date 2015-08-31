require( 'babel/register' )({
  stage: 0
});

var gulp = require( 'gulp' );
var arceus = require( './src/node' );

gulp.task( 'make:src', function() {
  return arceus.js.babelify( 'src/**/*', 'dist' );
});

gulp.task( 'make', function() {
  return arceus.util.gulpAsync( 'clean', [ 'make:src' ] );
});

gulp.task( 'clean', function() {
  return arceus.util.deleteAsync( 'dist' );
});

gulp.task( 'watch', function() {
  arceus.util.gulpWatch( 'src/**/*', [ 'make:src' ] );
});
