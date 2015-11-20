import glob from 'glob';
import resolvePathFromGlob from '../util/resolvePathFromGlob';
import Path from 'path';
import baseFromGlob from '../util/baseFromGlob';

export default function({ Plugin, types: t }) {
  return new Plugin( 'requireGlobify', {
    visitor: {
      CallExpression( node, parent, scope, file ) {
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
            let paths = glob.sync( globPath, {
              nodir: true
            });
            return t.objectExpression(
              paths.map( path => {
                var name = resolvePathFromGlob( globPath, path );
                var key = Path.dirname( name ) + '/' + Path.basename( name, Path.extname( name ) );
                key = key.replace( /^\.\//, '' );
                return t.property(
                  'init',
                  t.literal( key ),
                  t.callExpression( node.callee, [ t.literal( basePath + name ) ] )
                );
              })
            );
          }
        }
      }
    }
  });
};
