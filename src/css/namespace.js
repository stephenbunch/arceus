/**
 * @param {String} namespace
 * @param {Object} options
 * @param {RegExp} options.exclude
 * @returns {stream.Transform}
 */
export default function( namespace, { exclude } ) {
  var rework = require( 'gulp-rework' );
  var walk = require( 'rework-walk' );
  return rework( style => {
    walk( style, ( rule, node ) => {
      // Don't touch keyframes or font-face
      if ( !rule.selectors || rule.selectors.toString().indexOf( '@' ) >= 0 ) {
        return rule;
      }
      rule.selectors = rule.selectors.map( selector => {
        return selector.split( '.' ).map( className => {
          if ( !className ) {
            return className;
          }
          if ( exclude && exclude.test( className ) ) {
            return className;
          }
          return namespace + className;
        }).join( '.' );
      });
    })
  })
};
