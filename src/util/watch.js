/**
 * @param {String|Array.<String>} paths
 * @param {Function} callback
 * @returns {Function}
 */
export default function( paths, callback ) {
  if ( typeof callback !== 'function' ) {
    throw new Error( 'Callback must be a function.' );
  }
  if ( paths ) {
    if ( typeof paths === 'string' ) {
      paths = [ paths ];
    }
    if ( paths.length > 0 ) {
      var chokidar = require( 'chokidar' );
      var watcher = chokidar.watch( paths, {
        ignoreInitial: true
      });
      watcher.on( 'add', path => callback( path, 'add' ) );
      watcher.on( 'unlink', path => callback( path, 'unlink' ) );
      watcher.on( 'change', path => callback( path, 'change' ) );

      // Until this issue gets resolved, globbing over symlinks doesn't work.
      // https://github.com/paulmillr/chokidar/issues/293
      var glob = require( 'glob' );
      var files = paths.map( x => glob.sync( x ) ).reduce( ( all, files ) => {
        return all.concat( files );
      }, [] );
      watcher.add( files );
    }
  }
  return () => {
    if ( watcher ) {
      watcher.close();
      watcher = null;
    }
  };
};
