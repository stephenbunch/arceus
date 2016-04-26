require( 'babel-register' )({
  presets: [
    require( 'babel-preset-es2015' ),
    require( 'babel-preset-stage-0' )
  ],
  plugins: [
    require( 'babel-plugin-transform-decorators-legacy' ).default,
    [require( 'babel-plugin-transform-builtin-extend' ).default, {
      globals: ['Error', 'Array']
    }]
  ]
});
require( 'babel-polyfill' );

var Mocha = require( 'mocha' );
var chai = require( 'chai' );
var glob = require( 'glob' );
var sinon = require( 'sinon' );

var sinonChai = require( 'sinon-chai' );
chai.use( sinonChai );
chai.use( require( 'chai-as-promised' ) );

var mocha = new Mocha({ bail: true });

global.expect = chai.expect;
global.sinon = sinon;

glob( process.env.SPEC_FILES, function( err, files ) {
  if ( err ) {
    reply({
      error: stringFromError( err )
    });
  } else {
    files.forEach( function( file ) {
      mocha.addFile( file );
    });
    mocha.run( function( failures ) {
      if ( failures > 0 ) {
        reply({
          error: 'Test suite failed with ' + failures + ' failures.'
        });
      } else {
        reply({
          done: true
        });
      }
    });
  }
});

function stringFromError( err ) {
  return err.stack || err.name + ': ' + err.message;
}

function reply( obj ) {
  process.send( JSON.stringify( obj ) );
}
