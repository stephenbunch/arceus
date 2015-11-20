import log from '../util/log';
import requireGlobify from '../transformers/requireGlobify';

/**
 * @param {String} dirname
 * @returns {Object}
 */
export default function( dirname ) {
  var assign = require( 'lodash.assign' );
  var opts = {
    sourceRoot: dirname,
    stage: 0,
    plugins: [ requireGlobify ],
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
