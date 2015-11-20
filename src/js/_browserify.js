import babelOptions from './_babelOptions';
import envifyTransformer from '../transformers/envify';

/**
 * @param {Object} params
 * @param {String} params.entry Entry file.
 * @param {Object} params.config
 * @param {Object} params.config.envify Envify options.
 * @param {Object} params.config.uglify Uglifyify options.
 * @param {Object} params.config.browserify Browserify options.
 * @returns {Browserify}
 */
export default function( params ) {
  var merge = require( 'lodash.merge' );
  var path = require( 'path' );
  var assign = require( 'lodash.assign' );

  params = merge({
    config: {
      browserify: {
        debug: true,
        cache: {},
        packageCache: {}
      }
    }
  }, params );

  var { entry, config = {} } = params;
  var { envify, uglify, browserify, babelify } = config;

  browserify.entries = entry;

  var bundle = require( 'browserify' )( browserify );
  var babelOpts = babelOptions( path.dirname( entry ) );

  if ( babelify ) {
    babelOpts = babelify( babelOpts );
  }

  if ( envify ) {
    babelOpts.plugins = [
      ...babelOpts.plugins || [],
      envifyTransformer.configure( envify )
    ];
  }

  bundle = bundle.transform( require( 'babelify' ).configure( babelOpts ) );

  if ( uglify ) {
    if ( typeof uglify === 'boolean' ) {
      uglify = {};
    }
    bundle = bundle.transform(
      assign({
        global: true
      }, uglify ),
      require.resolve( 'uglifyify' )
    );
  }

  return bundle;
};
