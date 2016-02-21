import availablePortAsync from '../util/availablePortAsync';

export default async function( options ) {
  var { port } = options;
  var browserSync = require( 'browser-sync' ).create();
  browserSync.init({
    ...options,
    ui: {
      port: await availablePortAsync( 3000 )
    },
    port: await availablePortAsync( 3000 ),
    proxy: {
      target: `localhost:${ port }`,
      ws: true
    }
  });
  return {
    reload() {
      browserSync.reload();
    },

    injectCss( stream ) {
      stream.pipe( browserSync.stream() );
    }
  }
};
