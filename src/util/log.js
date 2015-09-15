export default function() {
  var gutil = require( 'gulp-util' );
  return gutil.log.apply( gutil, arguments );
};
