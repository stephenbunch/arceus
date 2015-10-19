import babelOptions from './_babelOptions';
import baseFromGlob from '../util/baseFromGlob';
import mergeStreams from '../util/mergeStreams';

/**
 * @param {String|Array.<String>} source
 * @param {String} outdir
 * @param {Object} [options={}]
 * @returns {stream.Readable}
 */
export default function( source, outdir, options = {} ) {
  if ( typeof source === 'string' ) {
    source = [ source ];
  }
  var gulp = require( 'gulp' );
  var babel = require( 'gulp-babel' );
  var assign = require( 'lodash.assign' );
  return mergeStreams(
    source.map( glob => {
      var stream = gulp.src( glob ).pipe(
        babel(
          assign( babelOptions( baseFromGlob( glob ) ), options )
        )
      ).on( 'error', err => ret.emit( 'error', err ) );
      var ret = stream.pipe( gulp.dest( outdir ) );
      return ret;
    })
  );
};
