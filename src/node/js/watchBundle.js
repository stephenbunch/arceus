import browserify from './_browserify';
import build from './_build';
import mergeStreams from '../util/mergeStreams';
import formatError from '../util/formatError';

/**
 * @typedef Watch
 * @property {Function} rebuild
 * @property {Function} dispose
 */

/**
 * @param {Object} params
 * @param {Function} [callback]
 * @returns {Watch}
 */
export default function( params, callback = ( () => {} )  ) {
  var path = require( 'path' );
  var chokidar = require( 'chokidar' );
  var watchify = require( 'watchify' );
  var cloneDeep = require( 'lodash.clonedeep' );
  var merge = require( 'lodash.merge' );

  params = merge( cloneDeep( params ), {
    config: {
      browserify: {
        cache: {},
        packageCache: {}
      }
    }
  });

  var { entry, outfile } = params;
  var minfile = outfile.replace( /\.js$/, '.min.js' );

  var bundle = watchify( browserify( params ) );
  var minify = watchify(
    browserify(
      merge( cloneDeep( params ), {
        config: {
          uglify: true
        }
      })
    )
  );

  var make = () => {
    mergeStreams([
      build( bundle, outfile ),
      build( minify, minfile )
    ])
    .on( 'error', err => console.log( formatError( err ) ) )
    .on( 'end', () => callback() );
  };

  var rebuild = () => {
    bundle.invalidate( entry );
  };

  bundle.on( 'update', make );

  // Since we typically use a di container to link code across a project
  // rather than module imports, watchify isn't able to detect new and
  // removed files since all the module imports happen in the index.js file
  // dynamically using the globify transform. So we'll use fireworm to
  // detect changes and tell browserify that the index file changed.
  var watcher = chokidar.watch( path.dirname( entry ), {
    ignoreInitial: true
  });
  watcher.on( 'add', file => rebuild() );
  watcher.on( 'unlink', file => rebuild() );

  make();

  return {
    rebuild,
    dispose: () => {
      bundle.close();
      watcher.close();
    }
  };
};
