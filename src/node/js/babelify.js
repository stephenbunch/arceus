import babelOptions from './_babelOptions';
import baseFromGlob from '../util/baseFromGlob';
import mergeStreams from '../util/mergeStreams';

/**
 * @param {String|Array.<String>} source
 * @param {String} outdir
 * @returns {stream.Readable}
 */
export default function( source, outdir ) {
  if ( typeof source === 'string' ) {
    source = [ source ];
  }
  var gulp = require( 'gulp' );
  var babel = require( 'gulp-babel' );
  return mergeStreams(
    source.map( glob => {
      var stream = gulp.src( glob ).pipe(
        babel(
          babelOptions( baseFromGlob( glob ) )
        )
      ).on( 'error', err => ret.emit( 'error', err ) );
      var ret = stream.pipe( gulp.dest( outdir ) );
      return ret;
    })
  );
};
