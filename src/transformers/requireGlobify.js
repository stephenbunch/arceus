import glob from 'glob';
import resolvePathFromGlob from '../util/resolvePathFromGlob';

export default function({ types: t }) {
  return {
    visitor: {
      CallExpression( path ) {
        var { node } = path;
        if (
          node.callee.name === 'require' &&
          node.arguments.length === 2 &&
          t.isStringLiteral( node.arguments[0] ) &&
          t.isObjectExpression( node.arguments[1] )
        ) {
          let mode = node.arguments[1].properties.find( x => x.key.name === 'mode' );
          if ( mode && mode.value.value === 'hash' ) {
            let globPath = node.arguments[0].value;
            let paths = glob.sync( globPath, {
              nodir: true
            });
            path.replaceWith(
              t.objectExpression(
                paths.map( path => {
                  var name = resolvePathFromGlob( globPath, path );
                  return t.objectProperty(
                    t.stringLiteral( name ),
                    t.callExpression( node.callee, [ t.stringLiteral( path ) ] )
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
