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
    if ( proc ) {
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
      var app = await startAsync( entry, options );
      proc = app.proc;
      server.port = app.message.port;
    }
  };
  var server = {
    async restartAsync() {
      log( 'Restaring server...' );
      await restartAsync();
      log( 'Server restarted' );
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
  return new Promise( resolve => {
    var { fork } = require( 'child_process' );
    var proc = fork( entry, args, {
      execArgv: nodeArgs
    });
    proc.on( 'message', function( message ) {
      try {
        message = JSON.parse( message );
        if ( message.status === 'online' ) {
          resolve({ proc, message });
        }
      } catch ( err ) {
        log( formatError( err ) );
      }
    });
  });
}
