export default function( ...tasks ) {
  return new Promise( ( resolve, reject ) => {
    var gulp = require( `${ process.env.PWD }/node_modules/gulp` );
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
