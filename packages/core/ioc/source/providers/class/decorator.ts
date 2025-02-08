import { container, Container } from "~/domain/container";
import { Token } from "~/domain/token";
import { errorify } from "~/utils/errorify";

import { PropertyMetadata, disposersMetadata, ParameterMetadata, registersMetadata, resolversMetadata, parametersMetadata, propertiesMetadata, dependenciesMetadata } from "./metadata";
import { ClassProvider } from "./provider";
import { Class } from "./types";

export enum DecoratorType {
  Class = "Class",
  Property = "Property",
  StaticProperty = "StaticProperty",
  Getter = "Getter",
  StaticGetter = "StaticGetter",
  Setter = "Setter",
  StaticSetter = "StaticSetter",
  Method = "Method",
  StaticMethod = "StaticMethod",
  Parameter = "Parameter",
}

export enum DecoratorLevel {
  Static = "Static",
  Instance = "Instance",
}

export interface DecoratorSignature {
  (target: any, propertyKey?: any, descriptor?: any): void;
  name: string;
}

export class DecoratorContext {
  name: string;

  target: any;
  propertyKey?: any;
  descriptor?: any;

  //

  get type() {
    if (this.target && this.propertyKey === undefined && this.descriptor === undefined) {
      return DecoratorType.Class;
    }

    if (this.descriptor === undefined) {
      if (typeof this.target === "function") {
        return DecoratorType.StaticProperty;
      }

      return DecoratorType.Property;
    }

    if (typeof this.descriptor === "number") {
      return DecoratorType.Parameter;
    }

    if (this.descriptor.value) {
      if (typeof this.target === "function") {
        return DecoratorType.StaticMethod;
      }

      return DecoratorType.Method;
    }

    if (this.descriptor.get || this.descriptor.set) {
      if (this.descriptor.get) {
        if (typeof this.target === "function") {
          return DecoratorType.StaticGetter;
        }

        return DecoratorType.Getter;
      }

      if (this.descriptor.set) {
        if (typeof this.target === "function") {
          return DecoratorType.StaticSetter;
        }

        return DecoratorType.Setter;
      }
    }

    throw new Error("Invalid decorator type");
  }

  get level() {
    if (typeof this.target === "function") {
      return DecoratorLevel.Static;
    }

    return DecoratorLevel.Instance;
  }

  get class() {
    if (typeof this.target === "function") {
      return this.target;
    }

    return this.target.constructor;
  }

  //

  /**
   * @example: MyClass
   */
  get className() {
    return this.class.name;
  }

  /**
   * @example: @MyDecorator
   */
  get decoratorName() {
    return `@${this.name}`;
  }

  /**
   * @example: MyClass.myProperty
   */
  get decoratorPath() {
    if (this.propertyKey === undefined) {
      return this.className;
    }

    return `${this.className}.${this.propertyKey}`;
  }

  //

  get dependencies() {
    return dependenciesMetadata.get(this.class) || [];
  }

  addDependency(...token: Token[]) {
    const metadata = dependenciesMetadata.from(this.class);

    const dependencies = metadata.get([]);

    dependencies.push(...token);

    metadata.set(dependencies);
  }

  //

  addParameter(parameterMetadata: ParameterMetadata) {
    const metadata = parametersMetadata.from(this.target, this.propertyKey);

    const parameters = metadata.get([]);

    parameters.push(parameterMetadata);

    metadata.set(parameters);
  }

  addProperty(propertyMetadata: PropertyMetadata) {
    const metadata = propertiesMetadata.from(this.target);

    const properties = metadata.get([]);

    properties.push(propertyMetadata);

    metadata.set(properties);
  }
}

export class RegisterContext extends DecoratorContext {
  container: Container;
  provider: ClassProvider<unknown>;
}

export class ResolveContext extends DecoratorContext {
  container: Container;
  provider: ClassProvider<unknown>;
  instance: any;
}

export class DisposeContext extends DecoratorContext {
  container: Container;
  provider: ClassProvider<unknown>;
  instance: any;
}

export type DecoratorHandler = (target: any, key?: any, descriptor?: any) => {
  apply?: DecoratorType | DecoratorType[];
  instance?: Class<unknown>;
  // 
  pre?: (DecoratorSignature | DecoratorSignature[]) | {
    [Type in DecoratorType]?: (DecoratorSignature | DecoratorSignature[]);
  };
  post?: (DecoratorSignature | DecoratorSignature[]) | {
    [Type in DecoratorType]?: (DecoratorSignature | DecoratorSignature[]);
  };
  // Container lifecycle hooks
  onInit?: ((context: DecoratorContext) => void) | {
    [Type in DecoratorType]?: (context: DecoratorContext) => void;
  };
  onBootstrap?: ((context: DecoratorContext) => (Promise<void> | void)) | {
    [Type in DecoratorType]?: (context: DecoratorContext) => (Promise<void> | void);
  };
  onShutdown?: ((context: DecoratorContext) => (Promise<void> | void)) | {
    [Type in DecoratorType]?: (context: DecoratorContext) => (Promise<void> | void);
  };
  // Provider lifecycle hooks
  onRegister?: ((context: RegisterContext) => (Promise<void> | void)) | {
    [Type in DecoratorType]?: (context: RegisterContext) => (Promise<void> | void);
  };
  onResolve?: ((context: ResolveContext) => (Promise<void> | void)) | {
    [Type in DecoratorType]?: (context: ResolveContext) => (Promise<void> | void);
  };
  onDispose?: ((context: DisposeContext) => (Promise<void> | void)) | {
    [Type in DecoratorType]?: (context: DisposeContext) => (Promise<void> | void);
  };
};

export const createDecorator = <Handler extends DecoratorHandler>(name: string, handler: Handler) => {
  return (...args: Parameters<Handler>): DecoratorSignature => {
    const decorator = (target: any, propertyKey?: any, descriptor?: any) => {
      const decorator = Reflect.apply(handler, null, args);

      const context = new DecoratorContext();

      context.name = name;
      context.target = target;
      context.propertyKey = propertyKey;
      context.descriptor = descriptor;

      if (decorator?.apply) {
        const types = Array.isArray(decorator.apply) ? decorator.apply : [decorator.apply];

        if (!types.includes(context.type)) {
          throw new Error(`Error in decorator "${context.decoratorName}" at "${context.decoratorPath}": Must be applied to ${types.join(" or ")}, but got "${context.type}"`);
        }
      }

      if (decorator?.instance) {
        if (!(context.class.prototype instanceof decorator.instance)) {
          throw new Error(`Error in decorator "${context.decoratorName}" at "${context.decoratorPath}": Must be applied to an instance of "${decorator.instance.name}"`);
        }
      }

      const executeDecorator = (decorator: DecoratorSignature, phase: "pre" | "post") => {
        try {
          decorator(target, propertyKey, descriptor);
        } catch (error: unknown) {
          throw new Error(`Error in ${phase} decorator "${decorator.name}" (used by "${context.decoratorName}" at "${context.decoratorPath}"): ${errorify(error)}`, {
            cause: error,
          });
        }
      };

      if (decorator?.pre) {
        if (typeof decorator.pre === "function") {
          executeDecorator(decorator.pre, "pre");
        } else if (Array.isArray(decorator.pre)) {
          for (const pre of decorator.pre) {
            executeDecorator(pre, "pre");
          }
        } else {
          const decorators = Object.entries(decorator.pre);

          for (const [type, pre] of decorators) {
            if (context.type === DecoratorType[type]) {
              if (typeof pre === "function") {
                executeDecorator(pre, "pre");
              } else if (Array.isArray(pre)) {
                for (const decorator of pre) {
                  executeDecorator(decorator, "pre");
                }
              }
            }
          }
        }
      }

      //

      if (decorator?.onInit) {
        try {
          if (typeof decorator.onInit === "function") {
            decorator.onInit(context);
          } else {
            const decorators = Object.entries(decorator.onInit);

            for (const [type, decorator] of decorators) {
              if (context.type === DecoratorType[type]) {
                decorator(context);
              }
            }
          }
        } catch (error: unknown) {
          throw new Error(`Init failed for decorator "${context.decoratorName}" at "${context.decoratorPath}": ${errorify(error)}`, {
            cause: error,
          });
        }
      }

      if (decorator?.onBootstrap) {
        container.on("bootstrap", () => {
          try {
            if (typeof decorator.onBootstrap === "function") {
              decorator.onBootstrap(context);
            } else {
              const decorators = Object.entries(decorator.onBootstrap);

              for (const [type, decorator] of decorators) {
                if (context.type === DecoratorType[type]) {
                  decorator(context);
                }
              }
            }
          } catch (error: unknown) {
            throw new Error(`Bootstrap failed for decorator "${context.decoratorName}" at "${context.decoratorPath}": ${errorify(error)}`, {
              cause: error,
            });
          }
        });
      }

      if (decorator?.onShutdown) {
        container.on("shutdown", () => {
          try {
            if (typeof decorator.onShutdown === "function") {
              decorator.onShutdown(context);
            } else {
              const decorators = Object.entries(decorator.onShutdown);

              for (const [type, decorator] of decorators) {
                if (context.type === DecoratorType[type]) {
                  decorator(context);
                }
              }
            }
          } catch (error: unknown) {
            throw new Error(`Shutdown failed for decorator "${context.decoratorName}" at "${context.decoratorPath}": ${errorify(error)}`, {
              cause: error,
            });
          }
        });
      }

      //

      if (decorator?.onRegister) {
        const metadata = registersMetadata.from(context.class);

        const registers = metadata.get([]);

        registers.push({
          handler: ({ container, provider }) => {
            try {
              const registerContext = new RegisterContext();

              registerContext.name = name;
              registerContext.target = target;
              registerContext.propertyKey = propertyKey;
              registerContext.descriptor = descriptor;

              registerContext.container = container;
              registerContext.provider = provider;

              if (typeof decorator.onRegister === "function") {
                decorator.onRegister(registerContext);
              } else {
                const decorators = Object.entries(decorator.onRegister);

                for (const [type, decorator] of decorators) {
                  if (registerContext.type === DecoratorType[type]) {
                    decorator(registerContext);
                  }
                }
              }
            } catch (error: unknown) {
              throw new Error(`Register failed for decorator "${context.decoratorName}" at "${context.decoratorPath}": ${errorify(error)}`, {
                cause: error,
              });
            }
          },
        });

        metadata.set(registers);
      }

      if (decorator?.onResolve) {
        const metadata = resolversMetadata.from(target);

        const resolvers = metadata.get([]);

        resolvers.push({
          handler: ({ container, provider, instance }) => {
            try {
              const resolveContext = new ResolveContext();

              resolveContext.name = name;
              resolveContext.target = target;
              resolveContext.propertyKey = propertyKey;
              resolveContext.descriptor = descriptor;

              resolveContext.container = container;
              resolveContext.provider = provider;
              resolveContext.instance = instance;

              if (typeof decorator.onResolve === "function") {
                decorator.onResolve(resolveContext);
              } else {
                const decorators = Object.entries(decorator.onResolve);

                for (const [type, decorator] of decorators) {
                  if (resolveContext.type === DecoratorType[type]) {
                    decorator(resolveContext);
                  }
                }
              }
            } catch (error: unknown) {
              throw new Error(`Resolve failed for decorator "${context.decoratorName}" at "${context.decoratorPath}": ${errorify(error)}`, {
                cause: error,
              });
            }
          },
        });

        metadata.set(resolvers);
      }

      if (decorator?.onDispose) {
        const metadata = disposersMetadata.from(target);

        const disposers = metadata.get([]);

        disposers.push({
          handler: ({ container, provider, instance }) => {
            try {
              const disposeContext = new DisposeContext();

              disposeContext.name = name;
              disposeContext.target = target;
              disposeContext.propertyKey = propertyKey;
              disposeContext.descriptor = descriptor;

              disposeContext.container = container;
              disposeContext.provider = provider;
              disposeContext.instance = instance;

              if (typeof decorator.onDispose === "function") {
                decorator.onDispose(disposeContext);
              } else {
                const decorators = Object.entries(decorator.onDispose);

                for (const [type, decorator] of decorators) {
                  if (disposeContext.type === DecoratorType[type]) {
                    decorator(disposeContext);
                  }
                }
              }
            } catch (error: unknown) {
              throw new Error(`Dispose failed for decorator "${context.decoratorName}" at "${context.decoratorPath}": ${errorify(error)}`, {
                cause: error,
              });
            }
          },
        });

        metadata.set(disposers);
      }

      //

      if (decorator?.post) {
        if (typeof decorator.post === "function") {
          executeDecorator(decorator.post, "post");
        } else if (Array.isArray(decorator.post)) {
          for (const post of decorator.post) {
            executeDecorator(post, "post");
          }
        } else {
          const decorators = Object.entries(decorator.post);

          for (const [type, post] of decorators) {
            if (context.type === DecoratorType[type]) {
              if (typeof post === "function") {
                executeDecorator(post, "post");
              } else if (Array.isArray(post)) {
                for (const decorator of post) {
                  executeDecorator(decorator, "post");
                }
              }
            }
          }
        }
      }

      return descriptor;
    };

    Reflect.defineProperty(decorator, "name", {
      value: name,
    });

    return decorator;
  };
};

export const createDecoratorScope = (scope: string) => {
  return <Handler extends DecoratorHandler>(name: string, handler: Handler) => {
    return createDecorator(`${scope}/${name}`, handler);
  };
};
