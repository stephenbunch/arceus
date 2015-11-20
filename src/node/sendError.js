import formatError from '../util/formatError';
import log from '../util/log';

export default function( error ) {
  if ( process.send ) {
    process.send({
      status: 'error',
      error: formatError( error )
    });
  } else {
    log( formatError( error ) );
  }
};
