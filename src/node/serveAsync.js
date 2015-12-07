import formatError from '../util/formatError';
import killProcessAsync from '../util/killProcessAsync';
import log from '../util/log';
import ManualResetEvent from '../util/_ManualResetEvent';

/**
 * @param {String} entry
 * @param {Object} [options={}]
 * @param {Array.<String>} [options.args=[]]
 * @param {Array.<String>} [options.nodeArgs=[]]
 * @returns {Promise}
 */
export default function serveAsync( entry, options = {} ) {
  var { args = [], nodeArgs = [] } = options;
  return new Promise( ( resolve, reject ) => {
    var { fork } = require( 'child_process' );
    args = [
      ...args,
      `${ process.env.PWD }/${ entry }`
    ];
    var proc = fork( require.resolve( './_runServer' ), args, {
      execArgv: nodeArgs
    });

    var chokidar = require( 'chokidar' );
    var watcher = chokidar.watch( [], {
      ignoreInitial: true
    });

    var restarting = false;
    var server = {
      _wait: new ManualResetEvent(),

      get ready() {
        return server._wait.handle;
      },

      async stopAsync() {
        watcher.close();
        await killProcessAsync( proc );
      },

      async restartAsync() {
        restarting = true;
        server._wait.reset();
        try {
          log( 'Restaring server...' );
          log( 'Killing process...' );
          await killProcessAsync( proc );
          log( 'Process killed' );

          let next = await serveAsync( entry, options );
          server.stopAsync = next.stopAsync;
          server.restartAsync = next.restartAsync;
          next._wait = server._wait;
          watcher.close();
          log( 'Server restarted' );

          server._wait.set();
        } catch( err ) {
          log( err.message );
        } finally {
          restarting = false;
        }
      }
    };

    proc.on( 'message', function( message ) {
      if ( message.event === 'require' ) {
        watcher.add( message.filename );
      } else if ( message.status === 'online' ) {
        server.result = message.result;
        watcher.on( 'change', function() {
          if ( !restarting ) {
            server.restartAsync();
          }
        });
        server._wait.set();
        resolve( server );
      } else if ( message.status === 'error' ) {
        reject( new Error( message.error ) );
      }
    });

    proc.on( 'error', function( err ) {
      console.log( formatError( err ) );
    });
  });
};
