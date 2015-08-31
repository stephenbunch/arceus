export default function( command ) {
  var exec = require( 'child_process' ).exec;
  return new Promise( ( resolve, reject ) => {
    var child = exec( command, err => {
      if ( err ) {
        reject( err );
      } else {
        resolve();
      }
    });
    child.stdout.pipe( process.stdout );
    child.stderr.pipe( process.stderr );
  });
};
