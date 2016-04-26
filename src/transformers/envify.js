export default {
  configure( env = {} ) {
    return function({ types: t }) {
      return {
        visitor: {
          MemberExpression( path, state ) {
            const { node, parent, scope } = path;
            const { file } = state;
            if (
              t.isMemberExpression( node.object ) &&
              node.object.object.name === 'process' &&
              node.object.property.name === 'env'
            ) {
              let prop =
                t.isLiteral( node.property ) ?
                node.property.value :
                node.property.name;
              let value = env[ prop ];
              if ( typeof value === 'string' ) {
                path.replaceWith( t.literal( value ) );
              } else {
                path.replaceWith( t.identifier( String( value ) ) );
              }
            }
          }
        }
      };
    };
  }
};
