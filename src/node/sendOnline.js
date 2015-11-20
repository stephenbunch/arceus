export default function( result ) {
  if ( process.send ) {
    process.send({
      status: 'online',
      result
    });
  }
};
