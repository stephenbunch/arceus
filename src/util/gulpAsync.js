export default function( gulp, ...tasks ) {
  return new Promise( ( resolve, reject ) => {
    var sequence = require( 'run-sequence' ).use( gulp );
    tasks = tasks.concat([
      function( err ) {
        if ( err ) {
          reject( err );
        } else {
          resolve();
        }
      }
    ]);
    sequence.apply( undefined, tasks );
  });
};
