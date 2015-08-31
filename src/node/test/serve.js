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
  var { server, runner } = require( 'karma' );
  var started = false;
  server.start(
    assign( karmaOptions( specFiles ), opts ),
    () => {
      runner.run( {} );
      started = true;
    }
  );
  return {
    reload: () => {
      if ( started ) {
        runner.run( {} );
      }
    }
  };
};
