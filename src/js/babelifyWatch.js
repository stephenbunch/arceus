import watch from '../util/watch';
import formatError from '../util/formatError';
import babelify from './babelify';
import resolvePathFromGlob from '../util/resolvePathFromGlob';
import deleteAsync from '../util/deleteAsync';
import log from '../util/log';

export default function( { source, outdir, options, callback = () => {} } ) {
  var Path = require( 'path' );
  return watch( source, function( path, action ) {
    if ( action === 'unlink' ) {
      let outfile = Path.join( outdir, resolvePathFromGlob( source, path ) );
      deleteAsync( outfile ).catch( err => log( formatError( err ) ) );
    } else {
      babelify({
        source: path,
        outdir: Path.join(
          outdir,
          Path.dirname(
            resolvePathFromGlob( source, path )
          )
        ),
        options
      }).on( 'error', err => log( formatError( err ) ) ).on( 'end', callback );
    }
  });
};
