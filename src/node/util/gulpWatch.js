import watch from './watch';
import formatError from './formatError';
import gulpAsync from './gulpAsync';

export default function( match, tasks ) {
  watch( match, function() {
    gulpAsync( tasks ).catch( err => {
      console.log( formatError( err ) );
    });
  });
};
