import formatError from '../util/formatError';
import killProcessAsync from '../util/killProcessAsync';
import log from '../util/log';

/**
 * @param {String} entry
 * @param {Object} [options={}]
 * @returns {Promise}
 */
export default async function( entry, options ) {
  var proc;
  var uid = 0;
  var killTask;
  var restartAsync = async () => {
    var id = ++uid;
    if ( proc && proc.connected ) {
      if ( !killTask ) {
        log( 'Killing process...' );
        killTask = killProcessAsync( proc ).then( () => {
          proc = null;
          killTask = null;
          log( 'Process killed' );
        });
      }
      await killTask;
    }
    if ( id === uid ) {
      let app = await startAsync( entry, options );
      if ( id === uid ) {
        proc = app.proc;
        if ( app.result.error ) {
          throw new Error( `Server error: ${ app.result.error }` );
        } else {
          server.port = app.result.port;
        }
      } else {
        await killProcessAsync( app.proc );
      }
    }
  };
  var server = {
    async restartAsync() {
      log( 'Restaring server...' );
      try {
        await restartAsync();
        log( 'Server restarted' );
      } catch( err ) {
        log( err.message )
      }
    },
    stopAsync() {
      return killProcessAsync( proc );
    }
  };
  await restartAsync();
  return server;
};

/**
 * @param {String} entry
 * @param {Object} [options={}]
 * @param {Array.<String>} [options.args=[]]
 * @param {Array.<String>} [options.nodeArgs=[]]
 * @returns {Promise}
 */
function startAsync( entry, { args = [], nodeArgs = [] } = {} ) {
  return new Promise( ( resolve, reject ) => {
    var { fork } = require( 'child_process' );
    var proc = fork( entry, args, {
      execArgv: nodeArgs
    });
    proc.on( 'message', function( message ) {
      var result;
      try {
        result = {
          proc,
          result: JSON.parse( message )
        };
      } catch ( err ) {
        log( formatError( err ) );
        reject( err );
        return;
      }
      resolve( result );
    });
  });
}
