export default {
  configure( shims = {} ) {
    return function({ Plugin, types: t }) {
      return new Plugin( 'shim', {
        visitor: {
          CallExpression( node, parent, scope, file ) {
            if (
              node.callee.name === 'require' &&
              node.arguments.length === 1 &&
              t.isLiteral( node.arguments[0] )
            ) {
              let module = node.arguments[0].value;
              if ( typeof shims[ module ] === 'string' ) {
                return t.memberExpression(
                  t.identifier( 'window' ),
                  t.identifier( shims[ module ] )
                );
              }
            }
          }
        }
      });
    };
  }
};
