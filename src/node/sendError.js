import formatError from '../util/formatError';

export default function( error ) {
  if ( process.send ) {
    process.send({
      status: 'error',
      error: formatError( error )
    });
  } else {
    console.log( formatError( error ) );
  }
};
