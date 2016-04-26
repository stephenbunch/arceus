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
      path.resolve( path.dirname( require.resolve( 'babel-polyfill' ) ) + '/../' ) + '/browser.js',
      path.dirname( require.resolve( 'chai' ) ) + '/chai.js',
      path.resolve( path.dirname( require.resolve( 'sinon' ) ) + '/../' ) + '/pkg/sinon.js',
      require.resolve( 'sinon-chai' ),
      require.resolve( 'chai-as-promised' ),
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
