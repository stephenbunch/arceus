/**
 * @param {String} specFiles Glob for spec files.
 * @returns {Object}
 */
export default function( specFiles ) {
  var path = require( 'path' );
  var ROOT_DIR = path.resolve( `${ __dirname }/../..` );
  return {
    frameworks: [ 'mocha', 'browserify' ],
    files: [
      ROOT_DIR + '/node_modules/babel/node_modules/babel-core/browser-polyfill.js',
      ROOT_DIR + '/node_modules/chai/chai.js',
      ROOT_DIR + '/node_modules/sinon/pkg/sinon.js',
      ROOT_DIR + '/node_modules/sinon-chai/lib/sinon-chai.js',
      ROOT_DIR + '/node_modules/chai-as-promised/lib/chai-as-promised.js',
      ROOT_DIR + '/karma_helpers.js',
      specFiles
    ],
    reporters: [ 'progress' ],
    port: 9876,
    colors: true,
    autoWatch: false,
    singleRun: false,
    browsers: [ 'Chrome' ],
    logLevel: 'INFO',
    captureConsole: true,
    preprocessors: {
      [ specFiles ]: 'browserify'
    },
    browserify: {
      debug: true,
      transform: [ require.resolve( 'babelify' ) ]
    },
    plugins: [
      require.resolve( 'karma-browserify' ),
      require.resolve( 'karma-mocha' ),
      require.resolve( 'karma-chrome-launcher' ),
      require.resolve( 'karma-phantomjs-launcher' )
    ]
  };
};
