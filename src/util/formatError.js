export default function( err ) {
  return err.stack || `${ err.name }: ${ err.message }`;
};
