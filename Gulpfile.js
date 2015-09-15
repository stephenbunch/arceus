require( 'babel/register' )({
  stage: 0
});

var gulp = require( 'gulp' );
var arceus = require( './src' );

gulp.task( 'make:src', function() {
  return arceus.js.babelify( 'src/**/*', 'dist' );
});

gulp.task( 'make', function() {
  return arceus.util.gulpAsync( gulp, 'clean', [ 'make:src' ] );
});

gulp.task( 'clean', function() {
  return arceus.util.deleteAsync( 'dist' );
});

gulp.task( 'watch', function() {
  arceus.util.watch( 'src/**/*', function() {
    arceus.util.gulpAsync( gulp, 'make:src' ).then( function() {
      return arceus.util.touchFileAsync( 'package.json' );
    }).catch( function( err ) {
      console.log( arceus.util.formatError( err ) );
    });
  });
});

gulp.task( 'default', function() {
  return arceus.util.gulpAsync( gulp, 'make' );
});
