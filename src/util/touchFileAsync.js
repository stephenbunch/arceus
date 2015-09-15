export default function( path ) {
  var fs = require( 'fs' );
  return new Promise( ( resolve, reject ) => {
    fs.utimes( path, new Date(), new Date(), err => {
      if ( err ) {
        reject( err );
      } else {
        resolve();
      }
    });
  });
};
