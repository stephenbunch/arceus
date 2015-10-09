/**
 * @param {Object} params
 * @param {String} params.entry Entry file.
 * @param {String} paras.outfile Destination path.
 * @param {stream.Transform} [params.transform]
 * @returns {stream.Readable}
 */
export default function({ entry, outfile, transform }) {
  var gulp = require( 'gulp' );
  var minify = require( 'gulp-minify-css' );
  var rename = require( 'gulp-rename' );
  var postcss = require( 'gulp-postcss' );
  var autoprefixer = require( 'autoprefixer-core' );
  var path = require( 'path' );
  var clone = require( 'gulp-clone' );
  var cssGlobbing = require( 'gulp-css-globbing' );
  var concat = require( 'gulp-concat' );

  var stream = gulp.src( entry ).pipe(
    cssGlobbing({
      extensions: [ '.css', path.extname( entry ) ]
    })
  );

  if ( transform ) {
    stream = stream.pipe( transform )
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
    .pipe(
      minify({
        keepSpecialComments: 0
      })
    )
    .pipe( rename({ extname: '.min.css' }) )
    .pipe( cloneSink.tap() )
    .pipe( gulp.dest( path.dirname( outfile ) ) );

  return ret;
};
