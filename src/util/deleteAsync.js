export default function( paths ) {
  return new Promise( ( resolve, reject ) => {
    require( 'del' )( paths, function( err, paths ) {
      if ( err ) {
        reject( err );
      } else {
        resolve( paths );
      }
    });
  });
};
