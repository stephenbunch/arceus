import mergeStreams from './mergeStreams';

/**
 * @param {Object.<String, String>} files
 *   A key-value pair of source glob and destination path.
 * @returns {stream.Readable}
 */
export default function( files ) {
  var gulp = require( 'gulp' );
  return mergeStreams(
    Object.keys( files ).map( key =>
      gulp.src( key ).pipe( gulp.dest( files[ key ] ) )
    )
  );
};
