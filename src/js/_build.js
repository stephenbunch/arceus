import mergeStreams from '../util/mergeStreams';
import exorcist from './_exorcist';

/**
 * @param {Browserify} bundle
 * @param {String} outfile
 * @returns {stream.Readable}
 */
export default function( bundle, outfile ) {
  var path = require( 'path' );
  var gulp = require( 'gulp' );

  var outdir = path.dirname( outfile );
  var outname = path.basename( outfile );

  var stream = bundle.bundle();
  stream.on( 'error', err => ret.emit( 'error', err ) );

  var ret = stream
    .pipe( exorcist( outfile + '.map' ) )
    .pipe( require( 'vinyl-source-stream' )( outname ) )
    .pipe( gulp.dest( outdir ) );

  return ret;
};
