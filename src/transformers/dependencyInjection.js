export default {
  configure( options = {} ) {
    return function({ types: t }) {
      return {
        visitor: {
          Program: function( path, state ) {
            const { node, parent, scope } = path;
            const { file } = state;
            if (
              typeof options.shouldTransform === 'function' &&
              !options.shouldTransform( file.opts.filename )
            ) {
              return;
            }

            var body = [];
            var imports = [];
            var defaultExport;
            node.body.forEach( function( node ) {
              switch ( node.type ) {
                case 'ImportDeclaration':
                  imports.push( node );
                  break;
                case 'ExportDefaultDeclaration':
                defaultExport = node;
                  break;
                default:
                  body.push( node );
              }
            });

            var names = [];
            var params = [];
            var header = [];
            imports.forEach( function( node ) {
              if ( typeof options.resolveName === 'function' ) {
                names.push(
                  t.literal(
                    options.resolveName( node.source.value, file.opts.filename ) ||
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
