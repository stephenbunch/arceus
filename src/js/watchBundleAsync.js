import browserify from './_browserify';
import build from './_build';
import mergeStreams from '../util/mergeStreams';
import formatError from '../util/formatError';
import log from '../util/log';
import touchFileAsync from '../util/touchFileAsync';

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
  var watchify = require( 'watchify' );
  var cloneDeep = require( 'lodash.clonedeep' );
  var merge = require( 'lodash.merge' );
  var fs = require( 'fs' );

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
    return mergeStreams([
      build( bundle, outfile ),
      build( minify, minfile )
    ]);
  };

  var rebuild = () => {
    touchFileAsync( entry ).catch( err => log( formatError( err ) ) );
  };

  bundle.on( 'update', () => {
    make()
      .on( 'error', err => log( formatError( err ) ) )
      .on( 'end', () => callback() );
  });

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

  return new Promise( ( resolve, reject ) => {
    make()
      .on( 'error', err => reject( err ) )
      .on( 'end', () => {
        resolve({
          rebuild,
          dispose: () => {
            bundle.close();
            watcher.close();
          }
        })
      });
  });
};
