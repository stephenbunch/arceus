export default function({ types: t }) {
  var VISITED = Symbol();
  return {
    visitor: {
      ClassExpression( path ) {
        if ( path.node[ VISITED ] ) {
          return;
        } else {
          path.node[ VISITED ] = true;
        }

        var decorated = [];
        path.node.body.body = path.node.body.body.filter( member => {
          if ( member.decorators ) {
            if (
              t.isClassMethod( member ) && (
                member.kind === 'get' || member.kind === 'set'
              )
            ) {
              throw new Error( 'Decorators are not supported yet on property getters/setters.' );
            }
            decorated.push( member );
            return false;
          }
          return true;
        });

        if ( decorated.length > 0 ) {
          let definitions = [];
          let Class = path.scope.generateUidIdentifier( 'Class' );
          let prototype = t.memberExpression( Class, t.identifier( 'prototype' ) );
          for ( let member of decorated ) {
            let descriptor = t.objectExpression([
              t.objectProperty(
                t.identifier( 'value' ),
                t.isClassProperty( member ) ?
                  member.value || t.identifier( 'undefined' ) :
                  t.functionExpression(
                    member.key,
                    member.params,
                    member.body,
                    member.generator,
                    member.async
                  )
              ),
              t.objectProperty(
                t.identifier( 'enumerable' ),
                t.booleanLiteral( t.isClassProperty( member ) )
              ),
              t.objectProperty(
                t.identifier( 'configurable' ),
                t.booleanLiteral( true )
              )
            ]);
            definitions.push(
              t.expressionStatement(
                t.callExpression(
                  t.memberExpression(
                    t.identifier( 'Object' ),
                    t.identifier( 'defineProperty' )
                  ),
                  [
                    prototype,
                    t.stringLiteral( member.key.name ),
                    t.logicalExpression(
                      '||',
                      t.callExpression(
                        member.decorators[0].expression,
                        [
                          prototype,
                          t.stringLiteral( member.key.name ),
                          descriptor
                        ]
                      ),
                      descriptor
                    )
                  ]
                )
              )
            );
          }
          path.replaceWith(
            t.callExpression(
              t.functionExpression(
                null,
                [],
                t.blockStatement([
                  t.variableDeclaration(
                    'var',
                    [
                      t.variableDeclarator( Class, path.node )
                    ]
                  ),
                  ...definitions,
                  t.returnStatement( Class )
                ])
              ),
              []
            )
          );
        }
      }
    }
  };
};
