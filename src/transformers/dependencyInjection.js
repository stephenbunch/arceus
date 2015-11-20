export default {
  configure( options = {} ) {
    return function({ types: t }) {
      var VISITED = Symbol();
      return {
        visitor: {
          Program( path, pluginPass ) {
            var { node, parent, scope } = path;
            var { filename } = pluginPass.file.opts;

            if ( node[ VISITED ] ) {
              return;
            } else {
              node[ VISITED ] = true;
            }

            if (
              typeof options.shouldTransform === 'function' &&
              !options.shouldTransform( filename )
            ) {
              return;
            }

            var body = [];
            var imports = [];
            var defaultExport;
            node.body.forEach( function( node ) {
              if ( t.isImportDeclaration( node ) ) {
                imports.push( node );
              } else if ( t.isExportDefaultDeclaration( node ) ) {
                defaultExport = node;
              } else {
                body.push( node );
              }
            });

            var names = [];
            var params = [];
            var header = [];
            imports.forEach( function( node ) {
              if ( typeof options.resolveName === 'function' ) {
                names.push(
                  t.stringLiteral(
                    options.resolveName( node.source.value, filename ) ||
                    node.source.value
                  )
                );
              } else {
                names.push( node.source );
              }
              if ( node.specifiers.length > 1 ) {
                var arg = scope.generateUidIdentifier( 'dep' );
                params.push( arg );
                header.push(
                  t.variableDeclaration(
                    'var',
                    node.specifiers.map( function( specifier ) {
                      return t.variableDeclarator(
                        specifier.local,
                        t.memberExpression( arg, specifier.local )
                      );
                    })
                  )
                );
              } else {
                params.push( node.specifiers[0].local );
              }
            });

            path.replaceWith(
              t.program([
                t.exportDefaultDeclaration(
                  t.arrayExpression(
                    names.concat([
                      t.functionExpression( null, params,
                        t.blockStatement(
                          header.concat( body ).concat([
                            t.returnStatement( defaultExport.declaration )
                          ])
                        )
                      )
                    ])
                  )
                )
              ])
            );
          }
        }
      };
    };
  }
};
