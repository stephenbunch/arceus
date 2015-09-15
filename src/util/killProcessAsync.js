/**
 * @param {child_process.ChildProcess} proc
 * @returns {Promise}
 */
export default function( proc ) {
  return new Promise( resolve => {
    proc.on( 'exit', () => resolve() );
    proc.kill();
  });
};
