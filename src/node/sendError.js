export default function( error ) {
  if ( process.send ) {
    process.send( JSON.stringify({ error }) );
  }
};
