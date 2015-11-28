import browserify from './_browserify';
import build from './_build';
import mergeStreams from '../util/mergeStreams';
import formatError from '../util/formatError';
import log from '../util/log';

/**
 * @typedef Watch
 * @property {Function} rebuild
 * @property {Function} dispose
 */

/**
 * @param {Object} params
 * @param {Function} [callback]
 * @returns {Promise.<Watch>}
 */
export default function( params, callback = ( () => {} )  ) {
  var path = require( 'path' );
  var chokidar = require( 'chokidar' );
  var rememberify = require( 'rememberify' );
  var cloneDeep = require( 'lodash.clonedeep' );
  var merge = require( 'lodash.merge' );
  var throttle = require( 'lodash.throttle' );

  params = merge( cloneDeep( params ), {
    config: {
      browserify: {
        cache: {}
      }
    }
  });

  var { entry, outfile } = params;
  var minfile = outfile.replace( /\.js$/, '.min.js' );

  // Since we typically use a di container to link code across a project
  // rather than module imports, watchify isn't able to detect new and
  // removed files since all the module imports happen in the index.js file
  // dynamically using the globify transform. So we'll use fireworm to
  // detect changes and tell browserify that the index file changed.
  var watcher = chokidar.watch( path.dirname( entry ), {
    ignoreInitial: true
  });
  watcher.on( 'add', () => invalidate( entry ) );
  watcher.on( 'unlink', () => invalidate( entry ) );
  watcher.on( 'change', file => invalidate( file ) );

  var bundle = browserify( params ).plugin( rememberify );
  var minify = browserify(
    merge( cloneDeep( params ), {
      config: {
        uglify: true
      }
    })
  ).plugin( rememberify );

  bundle.on( 'file', file => watcher.add( file ) );

  var invalidate = ( file ) => {
    if ( !file.startsWith( '/' ) ) {
      file = process.env.PWD + '/' + file;
    }
    rememberify.forget( bundle, file );
    rememberify.forget( minify, file );
    update();
  };

  var update = throttle( () => {
    make()
      .on( 'error', err => log( formatError( err ) ) )
      .on( 'end', () => callback() );
  }, 100, {
    trailing: true
  });

  var make = () => {
    return mergeStreams([
      build( bundle, outfile ),
      build( minify, minfile )
    ]);
  };

  return new Promise( ( resolve, reject ) => {
    make()
      .on( 'error', err => reject( err ) )
      .on( 'end', () => {
        resolve({
          dispose: () => {
            bundle.close();
            watcher.close();
          }
        })
      });
  });
};
