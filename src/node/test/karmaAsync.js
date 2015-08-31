import karmaOptions from './_karmaOptions';

/**
 * @param {String} specFiles
 * @param {Object} [opts]
 * @returns {Promise}
 */
export default function( specFiles, opts = {} ) {
  var { server } = require( 'karma' );
  var assign = require( 'lodash.assign' );
  return new Promise( resolve => {
    server.start(
      assign( karmaOptions( specFiles ), opts, { singleRun: true } ),
      resolve
    );
  });
};
