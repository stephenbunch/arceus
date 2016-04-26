export default {
  configure( shims = {} ) {
    return function({ types: t }) {
      return {
        visitor: {
          CallExpression( path, state ) {
            const { node, parent, scope } = path;
            const { file } = state;
            if (
              node.callee.name === 'require' &&
              node.arguments.length === 1 &&
              t.isLiteral( node.arguments[0] )
            ) {
              let module = node.arguments[0].value;
              if ( typeof shims[ module ] === 'string' ) {
                path.replaceWith(
                  t.memberExpression(
                    t.identifier( 'window' ),
                    t.stringLiteral( shims[ module ] ),
                    true
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
