import karmaOptions from './_karmaOptions';

/**
 * @typedef KarmaServer
 * @property {Function} reload
 */

/**
 * @param {String} specFiles
 * @param {Object} [opts]
 * @returns {Object}
 */
export default function( specFiles, opts = {} ) {
  var assign = require( 'lodash.assign' );
  var { Server, runner } = require( 'karma' );
  var started = false;
  var server = new Server(
    assign( karmaOptions( specFiles ), opts ),
    () => {
      runner.run( {} );
      started = true;
    }
  );
  server.start();
  return {
    reload: () => {
      if ( started ) {
        runner.run( {} );
      }
    }
  };
};
