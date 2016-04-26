import * as arceus from '../../src';
import { transform } from 'babel-core';

describe( 'shim', function() {
  it( 'should transform require statements to member expressions', function() {
    var result = transform( `var x = require( 'foo' );`, {
      plugins: arceus.transformers.shim.configure({
        'foo': 'foo-bar'
      })
    });
    expect( result.code.replace( /\n+/g, ' ' ) ).to.equal(
      `var x = window['foo-bar'];`
    );
  });
});
