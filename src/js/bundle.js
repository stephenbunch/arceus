import build from './_build';
import browserify from './_browserify';
import mergeStreams from '../util/mergeStreams';

export default function( params ) {
  var cloneDeep = require( 'lodash.clonedeep' );
  var merge = require( 'lodash.merge' );
  var path = require( 'path' );

  var { outfile } = params;
  var minfile = outfile.replace( /\.js$/, '.min.js' );

  var bundle = browserify( params );
  var minify = browserify(
    merge({
      config: {
        uglify: true
      }
    }, cloneDeep( params ) )
  );

  return mergeStreams([
    build( bundle, outfile ),
    build( minify, minfile )
  ]);
};
