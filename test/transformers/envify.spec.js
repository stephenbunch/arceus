import arceus from '../../src';
import { transform } from 'babel';

describe( 'envify', function() {
  it( 'should transform process.env statements to literals', function() {
    var result = transform( `var x = process.env.FOO`, {
      plugins: arceus.transformers.envify.configure({
        'FOO': 2
      })
    });
    expect( result.code.replace( /\n+/g, ' ' ) ).to.equal(
      `"use strict"; var x = 2;`
    );
  });
});
