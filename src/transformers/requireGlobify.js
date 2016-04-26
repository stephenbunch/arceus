import glob from 'glob';
import resolvePathFromGlob from '../util/resolvePathFromGlob';
import Path from 'path';
import baseFromGlob from '../util/baseFromGlob';

export default {
  configure( delegate = {} ) {
    return function({ types: t }) {
      return {
        visitor: {
          CallExpression( path, state ) {
            const { node, parent, scope } = path;
            const { file } = state;
            if (
              node.callee.name === 'require' &&
              node.arguments.length === 2 &&
              t.isLiteral( node.arguments[0] ) &&
              t.isObjectExpression( node.arguments[1] )
            ) {
              let mode = node.arguments[1].properties.find( x => x.key.name === 'mode' );
              if ( mode && mode.value.value === 'hash' ) {
                let globPath = node.arguments[0].value;
                let basePath = baseFromGlob( globPath );
                if ( !globPath.startsWith( '/' ) ) {
                  globPath = Path.resolve( Path.dirname( file.opts.filename ), globPath );
                }
                if ( delegate.onTransform ) {
                  delegate.onTransform({
                    file: file.opts.filename,
                    requireGlob: globPath
                  });
                }
                let paths = glob.sync( globPath, {
                  nodir: true
                });
                path.replaceWith(
                  t.objectExpression(
                    paths.map( path => {
                      var name = resolvePathFromGlob( globPath, path );
                      var key = Path.dirname( name ) + '/' + Path.basename( name, Path.extname( name ) );
                      key = key.replace( /^\.\//, '' );
                      return t.objectProperty(
                        t.stringLiteral( key ),
                        t.callExpression( node.callee, [ t.stringLiteral( basePath + name ) ] )
                      );
                    })
                  )
                );
              }
            }
          }
        }
      };
    };
  }
};
