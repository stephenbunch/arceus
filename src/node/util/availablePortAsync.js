export default function( basePort = 8000 ) {
  var portfinder = require( 'portfinder' );
  portfinder.basePort = basePort;
  return new Promise( ( resolve, reject ) => {
    portfinder.getPort( ( err, port ) => {
      if ( err ) {
        reject( err );
      } else {
        resolve( port );
      }
    });
  });
};
