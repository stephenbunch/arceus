import Module from 'module';
import sendError from './sendError';

var _load = Module.prototype.load;
Module.prototype.load = function( filename ) {
  process.send({
    event: 'require',
    filename: filename
  });
  return _load.apply( this, arguments );
};

try {
  Module._load( process.argv[ process.argv.length - 1 ], null, true );
  process._tickCallback();
} catch ( err ) {
  sendError( err );
}
