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

  var watcher = chokidar.watch([], {
    ignoreInitial: true
  });
  watcher.on( 'change', file => invalidate( file ) );

  var onRequireGlobifyTransform = ({ file, requireGlob }) => {
    var watch = chokidar.watch( requireGlob, {
      ignoreInitial: true
    });
    watch.add( file );
    watch.on( 'add', () => {
      watch.close();
      invalidate( file );
    });
    watch.on( 'unlink', ( path ) => {
      watch.close();
      if ( path !== file ) {
        invalidate( file );
      }
    });
    watch.on( 'change', ( path ) => {
      if ( path === file ) {
        watch.close();
      }
    });
  };

  var bundle = browserify({
    ...params,
    onRequireGlobifyTransform
  }).plugin( rememberify );

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
