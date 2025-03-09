import { container, Container } from "~/domain/container";

import { disposersMetadata, registersMetadata, resolversMetadata } from "./metadata";
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
}

export class RegisterContext<T> extends DecoratorContext {
  container: Container;
  provider: ClassProvider<T>;
}

export class ResolveContext<T> extends DecoratorContext {
  container: Container;
  provider: ClassProvider<T>;
  instance: T;
}

export class DisposeContext<T> extends DecoratorContext {
  container: Container;
  provider: ClassProvider<T>;
  instance: T;
}

export interface DecoratorSignature {
  (target: any, propertyKey?: any, descriptor?: any): void;
  name: string;
}

export type TypedDecoratorHooks = (DecoratorSignature | DecoratorSignature[]) | {
  [Type in DecoratorType]?: (DecoratorSignature | DecoratorSignature[]);
};

export type TypedLifecycleHooks<T> = ((context: T) => Promise<void> | void) | {
  [Type in DecoratorType]?: (context: T) => (Promise<void> | void);
};

export type DecoratorHandler<T = unknown, P extends any[] = any[]> = (...args: P) => {
  apply?: DecoratorType | DecoratorType[];
  instance?: Class<T>;
  // Decorator hooks
  pre?: TypedDecoratorHooks;
  post?: TypedDecoratorHooks;
  // Container lifecycle hooks
  onInit?: TypedLifecycleHooks<DecoratorContext>;
  onBootstrap?: TypedLifecycleHooks<DecoratorContext>;
  onShutdown?: TypedLifecycleHooks<DecoratorContext>;
  // Provider lifecycle hooks
  onRegister?: TypedLifecycleHooks<RegisterContext<T>>;
  onResolve?: TypedLifecycleHooks<ResolveContext<T>>;
  onDispose?: TypedLifecycleHooks<DisposeContext<T>>;
};

export const createDecorator = <T = unknown, P extends any[] = any[]>(name: string, handler: DecoratorHandler<T, P>) => {
  return (...args: P): DecoratorSignature => {
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

      if (decorator?.pre) {
        if (typeof decorator.pre === "function") {
          decorator.pre(target, propertyKey, descriptor);
        } else if (Array.isArray(decorator.pre)) {
          for (const pre of decorator.pre) {
            pre(target, propertyKey, descriptor);
          }
        } else {
          const decorators = Object.entries(decorator.pre);

          for (const [type, pre] of decorators) {
            if (context.type === DecoratorType[type]) {
              if (typeof pre === "function") {
                pre(target, propertyKey, descriptor);
              } else if (Array.isArray(pre)) {
                for (const decorator of pre) {
                  decorator(target, propertyKey, descriptor);
                }
              }
            }
          }
        }
      }

      //

      if (decorator?.onInit) {
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
      }

      if (decorator?.onBootstrap) {
        container.on("bootstrap", () => {
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
        });
      }

      if (decorator?.onShutdown) {
        container.on("shutdown", () => {
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
        });
      }

      //

      if (decorator?.onRegister) {
        registersMetadata.for(context.class).add({
          handler: ({ container, provider }) => {
            const registerContext = new RegisterContext<T>();

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
          },
        });
      }

      if (decorator?.onResolve) {
        resolversMetadata.for(target).add({
          handler: ({ container, provider, instance }) => {
            const resolveContext = new ResolveContext<T>();

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
          },
        });
      }

      if (decorator?.onDispose) {
        disposersMetadata.for(target).add({
          handler: ({ container, provider, instance }) => {
            const disposeContext = new DisposeContext<T>();

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
          },
        });
      }

      //

      if (decorator?.post) {
        if (typeof decorator.post === "function") {
          decorator.post(target, propertyKey, descriptor);
        } else if (Array.isArray(decorator.post)) {
          for (const post of decorator.post) {
            post(target, propertyKey, descriptor);
          }
        } else {
          const decorators = Object.entries(decorator.post);

          for (const [type, post] of decorators) {
            if (context.type === DecoratorType[type]) {
              if (typeof post === "function") {
                post(target, propertyKey, descriptor);
              } else if (Array.isArray(post)) {
                for (const decorator of post) {
                  decorator(target, propertyKey, descriptor);
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
  return <T, P extends any[] = any[]>(name: string, handler: DecoratorHandler<T, P>) => {
    return createDecorator(`${scope}/${name}`, handler);
  };
};
