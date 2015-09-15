import karmaOptions from './_karmaOptions';

/**
 * @param {String} specFiles
 * @param {Object} [opts]
 * @returns {Promise}
 */
export default function( specFiles, opts = {} ) {
  var { Server } = require( 'karma' );
  var assign = require( 'lodash.assign' );
  return new Promise( resolve => {
    var server = new Server(
      assign( karmaOptions( specFiles ), opts, { singleRun: true } ),
      resolve
    );
    server.start();
  });
};
