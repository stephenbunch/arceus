/**
 * @param {String} pattern
 * @returns {String}
 */
export default function( pattern ) {
  var glob2base = require( 'glob2base' );
  var glob = require( 'glob' );
  return glob2base( new glob.Glob( pattern ) );
};
