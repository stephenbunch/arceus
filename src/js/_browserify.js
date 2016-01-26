import babelOptions from './_babelOptions';
import envifyTransformer from '../transformers/envify';
import shimTransformer from '../transformers/shim';
import requireGlobify from '../transformers/requireGlobify';

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
  var { envify, uglify, browserify, babelify, shim } = config;

  browserify.entries = entry;

  var bundle = require( 'browserify' )( browserify );
  var babelOpts = babelOptions( path.dirname( entry ) );

  if ( babelify ) {
    babelOpts = babelify( babelOpts );
  }

  babelOpts.plugins = babelOpts.plugins || [];

  babelOpts.plugins = [
    ...babelOpts.plugins,
    requireGlobify.configure({
      onTransform: params.onRequireGlobifyTransform
    })
  ];

  if ( envify ) {
    babelOpts.plugins = [
      ...babelOpts.plugins,
      envifyTransformer.configure( envify )
    ];
  }

  if ( shim ) {
    babelOpts.plugins = [
      ...babelOpts.plugins,
      shimTransformer.configure( shim )
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
