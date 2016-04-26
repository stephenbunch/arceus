import log from '../util/log';

/**
 * @param {String} dirname
 * @returns {Object}
 */
export default function( dirname, params = {} ) {
  var assign = require( 'lodash.assign' );
  var opts = {
    sourceRoot: dirname,
    presets: [
      require( 'babel-preset-es2015' ),
      require( 'babel-preset-stage-0' )
    ],
    plugins: [
      require( 'babel-plugin-transform-decorators-legacy' ).default,
      [require( 'babel-plugin-transform-builtin-extend' ).default, {
        globals: ['Error', 'Array']
      }]
    ],
    sourceMaps: true
  };

  // Babel only looks in the current working directory for babelrc files. For
  // library projects, having one babelrc at the project root is enough. But for
  // web projects that contain both web and node code, we'll want to be able to
  // specify different babel configurations for each platform (eg. use
  // generators in node but not on the web.)
  assign( opts, resolveRc( dirname ) );

  return opts;
};

/**
 * @param {String} dirname
 * @returns {Object}
 */
function resolveRc( dirname ) {
  var fs = require( 'fs' );
  var stripJsonComments = require( 'strip-json-comments' );
  if ( fs.existsSync( dirname + '/.babelrc' ) ) {
    var babelrc = fs.readFileSync( dirname + '/.babelrc', 'utf8' );
    try {
      return JSON.parse( stripJsonComments( babelrc ) );
    } catch ( err ) {
      log( err );
    }
  }
  return {};
}
