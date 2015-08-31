import availablePortAsync from '../util/availablePortAsync';

export default async function({ port }) {
  var browserSync = require( 'browser-sync' ).create();
  browserSync.init({
    ui: {
      port: await availablePortAsync( 3000 )
    },
    port: await availablePortAsync( 3000 ),
    proxy: `localhost:${ port }`
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
