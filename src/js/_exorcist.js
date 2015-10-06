// Taken from https://github.com/thlorenz/exorcist

export default function( file ) {
  var mold = require( 'mold-source-map' );
  var fs = require( 'fs' );
  return mold.transform( function( src, write ) {
    var separated = separate( src, file );
    fs.writeFile( file, separated.json, 'utf8', function() {
      write( separated.comment );
    });
  });
};

function separate( src, file ) {
  var path = require( 'path' );
  var checksum = require( 'checksum' );

  src.sourceRoot( '' );

  var json = src.toJSON( 2 );
  var url = path.basename( file ) + '?' + checksum( json );

  var comment = '';
  var commentRx = /^\s*\/(\/|\*)[@#]\s+sourceMappingURL/mg;
  var commentMatch = commentRx.exec( src.source );
  var commentBlock = ( commentMatch && commentMatch[1] === '*' );

  if ( commentBlock ) {
    comment = '/*# sourceMappingURL=' + url + ' */';
  } else {
    comment = '//# sourceMappingURL=' + url;
  }

  return { json: json, comment: comment }
}
