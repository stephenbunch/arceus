export default function( publicDir, path ) {
  var URI = require( 'URIjs' );
  var checksum = require( 'checksum' );
  var filename = `${ publicDir }/${ path.replace( /^\//, '' ) }`;
  return new Promise( ( resolve, reject ) => {
    checksum.file( filename, function( err, digest ) {
      if ( err ) {
        reject( err );
      } else {
        var uri = new URI( path );
        uri.addQuery( digest );
        return uri.toString();
      }
    });
  });
}
