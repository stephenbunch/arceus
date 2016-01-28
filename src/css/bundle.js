import mergeStreams from '../util/mergeStreams';

/**
 * @param {Object} params
 * @param {
     String |
     Array.<String> |
     Array.<{entry: String, transform: stream.Transform?}>
   } params.entry Entry file(s).
 * @param {String} paras.outfile Destination path.
 * @param {stream.Transform} [params.transform]
 * @returns {stream.Readable}
 */
export default function({ entry, outfile, transform }) {
  var gulp = require( 'gulp' );
  var nano = require( 'gulp-cssnano' );
  var rename = require( 'gulp-rename' );
  var postcss = require( 'gulp-postcss' );
  var autoprefixer = require( 'autoprefixer' );
  var path = require( 'path' );
  var clone = require( 'gulp-clone' );
  var concat = require( 'gulp-concat' );

  let streams = [];
  if ( typeof entry === 'string' ) {
    streams = [ gulp.src( entry ) ];
  } else if ( Array.isArray( entry ) ) {
    streams = entry.map( entry => {
      let transform;
      if ( typeof entry === 'object' ) {
        transform = entry.transform;
        entry = entry.entry;
      }
      var stream = cssStream( entry );
      if ( transform ) {
        stream = transform( stream )
          .on( 'error', err => ret.emit( 'error', err ) );
      }
      return stream;
    });
  }

  var stream = mergeStreams( streams );
  if ( transform ) {
    stream = transform( stream )
      .on( 'error', err => ret.emit( 'error', err ) );
  }

  var cloneSink = clone.sink();
  var ret = stream
    .pipe(
      postcss([
        autoprefixer({
          browsers: [ 'last 2 versions' ]
        })
      ]).on( 'error', err => ret.emit( 'error', err ) )
    )
    .pipe( concat( path.basename( outfile ) ) )
    .pipe( cloneSink )
    .pipe( nano() )
    .pipe( rename({ extname: '.min.css' }) )
    .pipe( cloneSink.tap() )
    .pipe( gulp.dest( path.dirname( outfile ) ) );

  return ret;
};

function cssStream( entry ) {
  var gulp = require( 'gulp' );
  var path = require( 'path' );
  var cssGlobbing = require( 'gulp-css-globbing' );
  return gulp.src( entry ).pipe(
    cssGlobbing({
      extensions: [ '.css', path.extname( entry ) ]
    })
  );
}
