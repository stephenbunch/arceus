/**
 * @param {child_process.ChildProcess} proc
 * @returns {Promise}
 */
export default function( proc ) {
  return new Promise( resolve => {
    proc.kill();
    if ( proc.connected ) {
      proc.on( 'exit', () => resolve() );  
    } else {
      resolve();
    }
  });
};
