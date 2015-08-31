import Bundle from '../common/Bundle';

export default class NodeBundle extends Bundle {
  registerDirectory( dirname, options ) {
    var glob = require( 'glob' );
    var path = require( 'path' );
    var files = glob.sync( '**/*.*', {
      cwd: dirname
    });
    var modules = {};
    for ( let file of files ) {
      let name = file.substr( 0, file.length - path.extname( file ).length );
      modules[ name ] = require( dirname + '/' + file );
    }
    this.registerModules( modules, options );
  }
};
