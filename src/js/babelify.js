import babelOptions from './_babelOptions';
import baseFromGlob from '../util/baseFromGlob';
import mergeStreams from '../util/mergeStreams';
import requireGlobify from '../transformers/requireGlobify';

/**
 * @param {String|Array.<String>} source
 * @param {String} outdir
 * @param {Function} [options=x => x]
 * @returns {stream.Readable}
 */
export default function( { source, outdir, options = opts => opts, params = {} } ) {
  if ( typeof source === 'string' ) {
    source = [ source ];
  }
  var gulp = require( 'gulp' );
  var babel = require( 'gulp-babel' );
  return mergeStreams(
    source.map( glob => {
      var babelOpts = babelOptions( baseFromGlob( glob ) );
      babelOpts.plugins = babelOpts.plugins || [];
      babelOpts.plugins = [
        ...babelOpts.plugins,
        requireGlobify.configure({
          onTransform: params.onRequireGlobifyTransform
        })
      ];
      var stream = gulp.src( glob ).pipe(
        babel( options( babelOpts ) )
      ).on( 'error', err => ret.emit( 'error', err ) );
      var ret = stream.pipe( gulp.dest( outdir ) );
      return ret;
    })
  );
};
