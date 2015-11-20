import baseFromGlob from './baseFromGlob';

/**
 * @param {String} glob
 * @param {String} path
 * @returns {String}
 */
export default function( glob, path ) {
  var minimatch = require( 'minimatch' );
  if ( !minimatch( path, glob ) ) {
    throw new Error( `Path ${ path } must match glob ${ glob }.` );
  }
  var base = baseFromGlob( glob );
  return path.substr( base.length );
};
