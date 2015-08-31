import { Kernel } from '@stephenbunch/di';

export default class Bundle {
  constructor( name ) {
    this.name = name;

    this._kernel = new Kernel();

    /**
     * @type {Array.<String}>
     */
    this._globals = [];
    this._modules = [];
  }

  get resolvers() {
    return this._kernel.resolvers;
  }

  get asyncResolvers() {
    return this._kernel.asyncResolvers;
  }

  get redirects() {
    return this._kernel.redirects;
  }

  get localResolvers() {
    return this._kernel.localResolvers;
  }

  listModules() {
    return this._modules.slice();
  }

  register( name, value ) {
    this._kernel.register( name, value );
  }

  resolve( name ) {
    return this._kernel.resolve( name );
  }

  resolveAsync( name ) {
    return this._kernel.resolveAsync( name );
  }

  invokeAsync( name, target, locals ) {
    return this._kernel.invokeAsync( name, target, locals );
  }

  registerModules(
    modules,
    {
      ignore = [],
      asyncServices = false,
      namespace = ''
    } = {}
  ) {
    for ( let key in modules ) {

      // Skip ignored paths.
      let skip = false;
      for ( let path of ignore ) {
        if ( /\/$/.test( path ) ) {
          if ( key.startsWith( path ) ) {
            skip = true;
            break;
          }
        } else {
          if ( key === path ) {
            skip = true;
            break;
          }
        }
      }
      if ( skip ) {
        continue;
      }

      let segments = key.split( '/' );
      let fullName = namespace + key;

      let indexOfDollarSign = -1;
      for ( let segment of segments ) {
        if ( segment.startsWith( '$' ) ) {
          indexOfDollarSign = segments.indexOf( segment );
          break;
        }
      }
      let shortName =
        indexOfDollarSign > -1 ?
        segments.slice( indexOfDollarSign ).join( '/' ) :
        segments[ segments.length - 1 ];

      // Modules that begin with '$' also represent a service. Since services
      // will always be singletons, we can allow them to initialize
      // asynchronously.
      try {
        if ( asyncServices && /^_?\$/.test( shortName ) ) {
          this._kernel.registerAsyncFactoryAsSingleton( fullName, modules[ key ] );
        } else {
          this._kernel.registerFactoryAsSingleton( fullName, modules[ key ] );
        }
      } catch( err ) {
        throw new Error( `Module registration failed for "${ key }" because [${ err.message }]` );
      }

      // Modules that begin with '$' or '@' are registered as top level modules.
      // Meaning, if the module is found inside 'some/name/space/$module', it's
      // registered as '$module'.

      let topLevel = false;
      if ( /^_?(@|\$|^[A-Z_]+$)/.test( shortName ) ) {
        topLevel = true;
      }

      if ( topLevel ) {
        this._kernel.registerAlias( shortName, fullName );
      }

      // Mimic the node convention where requiring a directory requires the
      // index file.
      if ( key.endsWith( '/index' ) ) {
        this._kernel.registerAlias( fullName.replace( /\/index$/, '' ), fullName );

        if ( topLevel ) {
          this._kernel.registerAlias( shortName.replace( /\/index$/, '' ), fullName );
        }
      }

      // Modules that begin with '_' are treated as internal modules, meaning
      // they cannot be resolved from the kernel directly.

      // In other words, when we register a module that begins with '_' like
      // '_Foo', register an alias 'Foo' -> '_Foo', but only enable the alias
      // when the module is being resolved as a dependency of another module
      // within the kernel. This means when we try to do a
      // kernel.resolve( 'Foo' ), we get a ServiceNotFoundError, but if we have
      // a service 'Bar' that depends on 'Foo', the resolution works.

      if ( /^_/.test( shortName ) ) {
        let segs = segments.slice();
        segs.pop();
        segs.push( shortName.substr( 1 ) );
        let preferredName = namespace + segs.join( '/' );
        this._kernel.redirects.push({
          redirect( name, namedNode ) {
            if ( namedNode && namedNode.isChildNode && name === preferredName ) {
              return fullName;
            }
          }
        });
      }

      this._modules.push( fullName );
    }
  }

  /**
   * Registers a global module name.
   * @param {String} name
   * @param {*} [value]
   */
  registerGlobal( name, value ) {
    this._globals.push( name );
    if ( value !== undefined ) {
      this.register( name, value );
    }
  }

  /**
   * @param {String} fromNamespace
   * @param {Bundle} toBundle
   * @param {String} [toNamespace=""]
   */
  registerLink( fromNamespace, toBundle, toNamespace = '' ) {
    this._registerLink( fromNamespace, toBundle, toNamespace, false );
  }

  /**
   * @param {String} fromNamespace
   * @param {Bundle} toBundle
   * @param {String} [toNamespace=""]
   */
  registerInternalLink( fromNamespace, toBundle, toNamespace = '' ) {
    this._registerLink( fromNamespace, toBundle, toNamespace, true );
  }

  /**
   * @param {String} namespace
   */
  registerVoid( namespace ) {
    var noop = () => {};
    this.resolvers.push({
      resolve( name ) {
        if ( name.startsWith( namespace ) ) {
          return noop;
        }
      }
    });
  }

  /**
   * @param {String} fromNamespace
   * @param {Bundle} toBundle
   * @param {String} toNamespace
   * @param {Boolean} isInternal
   */
  _registerLink( fromNamespace, toBundle, toNamespace, isInternal ) {
    this.resolvers.push({
      resolve: ( name, namedNode ) => {
        if (
          ( !isInternal || namedNode && namedNode.isChildNode ) &&
          name.startsWith( fromNamespace )
        ) {
          return toBundle._kernel.factoryFor(
            toNamespace +
            name.substr( fromNamespace.length )
          );
        }
      }
    });
    this.asyncResolvers.push({
      resolveAsync: ( name, namedNode ) => {
        return Promise.resolve().then( () => {
          if (
            ( !isInternal || namedNode && namedNode.isChildNode ) &&
            name.startsWith( fromNamespace )
          ) {
            return toBundle._kernel.factoryForAsync(
              toNamespace +
              name.substr( fromNamespace.length )
            );
          }
        });
      }
    });
    this._delegateGlobals( toBundle );
  }

  /**
   * Delegates internal resolutions of global modules to the specified kernel.
   * @param {Bundle} bundle
   */
  _delegateGlobals( bundle ) {
    this.resolvers.push({
      resolve: ( name, namedNode ) => {
        if ( namedNode && namedNode.isChildNode ) {
          if ( this._matchesGlobal( name, bundle ) ) {
            return bundle.factoryFor( name );
          }
        }
      }
    });
    this.asyncResolvers.push({
      resolveAsync: ( name, namedNode ) => {
        return Promise.resolve().then( () => {
          if ( namedNode && namedNode.isChildNode ) {
            if ( this._matchesGlobal( name, bundle ) ) {
              return bundle.factoryForAsync( name );
            }
          }
        });
      }
    });
  }

  /**
   * @param {String} name
   * @param {Bundle} bundle
   */
  _matchesGlobal( name, bundle ) {
    // Modules beginning with an '@' or '$' sign are automatically treated as
    // globals.
    if ( /^(@|\$)/.test( name ) ) {
      if ( bundle.targetForName( name ) ) {
        return true;
      }
    }
    // Names beginning with a ':' are treated as namespaced modules. Bundles
    // have the ability to publish an entire namespace as a global.
    if (
      name.indexOf( ':' ) > -1 &&
      bundle._globals.indexOf(
        name.substring( 0, name.indexOf( ':' ) + 1 )
      ) > -1
    ) {
      return true;
    }
    if ( bundle._globals.indexOf( name ) > -1 ) {
      return true;
    }
    return false;
  }
};
