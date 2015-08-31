/**
 * @param {String} specFiles
 * @returns {Promise}
 */
export default function( specFiles ) {
  var { fork } = require( 'child_process' );
  var runner = fork( './_mochaRunner.js', {
    env: {
      SPEC_FILES: specFiles
    }
  });
  return new Promise( ( resolve, reject ) => {
    runner.on( 'message', response => {
      if ( response.error ) {
        reject( new Error( response.error ) );
      } else {
        resolve();
      }
    });
  });
};
