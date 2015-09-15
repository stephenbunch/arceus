import watch from './watch';
import formatError from '../util/formatError';
import gulpAsync from './gulpAsync';
import log from './log';

export default function( gulp, match, tasks ) {
  watch( match, function() {
    gulpAsync( gulp, tasks ).catch( err => {
      log( formatError( err ) );
    });
  });
};
