export default {
  configure( env = {} ) {
    return function({ Plugin, types: t }) {
      return new Plugin( 'envify', {
        visitor: {
          MemberExpression( node, parent, scope, file ) {
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
                return t.literal( value );
              } else {
                return t.identifier( String( value ) );
              }
            }
          }
        }
      });
    };
  }
};
