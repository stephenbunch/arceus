/**
 * @param {Array.<stream.Stream>} streams
 * @returns {stream.Readable}
 */
export default function( streams ) {
  var merge = require( 'merge-stream' );
  var countdown = streams.length;
  var ret = merge.apply(
    undefined,
    streams.map( stream => {
      return stream
        .on( 'error', err => ret.emit( 'error', err ) )
        .on( 'end', () => {
          // Why are node streams so inconsistent? Why the hell is 'end' not
          // firing on the merge stream?
          if ( --countdown === 0 ) {
            ret.emit( 'end' );
          }
        });
    })
  );
  return ret;
};
