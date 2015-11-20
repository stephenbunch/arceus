/**
 * @param {String} pattern
 * @returns {String}
 */
export default function( pattern ) {
  var glob2base = require( 'glob2base' );
  var glob = require( 'glob' );
  var base = glob2base( new glob.Glob( pattern ) );
  if ( pattern.startsWith( './' ) && !base.startsWith( './' ) ) {
    base = './' + base;
  }
  return base;
};
