import arceus from '../../src';
import { transform } from 'babel';

describe( 'shim', function() {
  it( 'should transform require statements to member expressions', function() {
    var result = transform( `var x = require( 'foo' );`, {
      plugins: arceus.transformers.shim.configure({
        'foo': 'foo-bar'
      })
    });
    expect( result.code.replace( /\n+/g, ' ' ) ).to.equal(
      `'use strict'; var x = window['foo-bar'];`
    );
  });
});
