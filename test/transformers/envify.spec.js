import * as arceus from '../../src';
import { transform } from 'babel-core';

describe( 'envify', function() {
  it( 'should transform process.env statements to literals', function() {
    var result = transform( `var x = process.env.FOO`, {
      plugins: arceus.transformers.envify.configure({
        'FOO': 2
      })
    });
    expect( result.code.replace( /\n+/g, ' ' ) ).to.equal(
      `var x = 2;`
    );
  });
});
