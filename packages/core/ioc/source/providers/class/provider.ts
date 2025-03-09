import { Lifetime, Provider, ResolutionConfig } from "~/domain/provider";

import { disposersMetadata, registersMetadata, resolversMetadata, parametersMetadata, propertiesMetadata } from "./metadata";
import { ClassRegisterConfig } from "./types";

export class ClassProvider<T> extends Provider<T> {
  declare config: ClassRegisterConfig<T>;

  singleton: T | null = null;
  transient: T[] = [];

  register = async () => {
    const config = this.mergeResolutionConfig();

    const constructor = this.config.useClass;

    const staticProperties = propertiesMetadata.get(constructor);

    for (const property of staticProperties) {
      constructor[property.propertyKey] = await property.handler({
        value: constructor[property.propertyKey],
        container: this.container,
        ...config,
      });
    }

    const staticRegisters = registersMetadata.get(constructor);

    for (const register of staticRegisters) {
      await register.handler({
        container: this.container,
        provider: this,
        ...config,
      });
    }
  };

  resolve = async (resolutionConfig?: ResolutionConfig) => {
    const config = this.mergeResolutionConfig(resolutionConfig);

    const constructor = this.config.useClass;

    if (config.lifetime === Lifetime.Singleton) {
      if (this.singleton) {
        return this.singleton;
      }
    }

    const args: unknown[] = [];

    const constructorParameters = parametersMetadata.get(constructor);

    for (const parameter of constructorParameters) {
      args[parameter.parameterIndex] = await parameter.handler({
        value: args[parameter.parameterIndex],
        container: this.container,
        ...config,
      });
    }

    const instance = new constructor(...args);

    const instanceProperties = propertiesMetadata.get(instance);

    for (const property of instanceProperties) {
      instance[property.propertyKey] = await property.handler({
        value: instance[property.propertyKey],
        container: this.container,
        ...config,
      });
    }

    const staticResolvers = resolversMetadata.get(constructor);

    for (const resolver of staticResolvers) {
      await resolver.handler({
        instance,
        container: this.container,
        provider: this,
        ...config,
      });
    }

    const instanceResolvers = resolversMetadata.get(instance);

    for (const resolver of instanceResolvers) {
      await resolver.handler({
        instance,
        container: this.container,
        provider: this,
        ...config,
      });
    }

    switch (config.lifetime) {
      case Lifetime.Singleton: {
        this.singleton = instance;
        break;
      }
      case Lifetime.Transient: {
        this.transient.push(instance);
      }
    }

    return instance;
  };

  dispose = async (resolutionConfig?: ResolutionConfig) => {
    const config = this.mergeResolutionConfig(resolutionConfig);

    const constructor = this.config.useClass;

    const instances = [...this.transient];

    if (this.singleton) {
      instances.push(this.singleton);
    }

    for (const instance of instances) {
      const instanceDisposers = disposersMetadata.get(instance);

      for (const disposer of instanceDisposers) {
        await disposer.handler({
          instance,
          container: this.container,
          provider: this,
          ...config,
        });
      }

      const staticDisposers = disposersMetadata.get(constructor);

      for (const disposer of staticDisposers) {
        await disposer.handler({
          instance,
          container: this.container,
          provider: this,
          ...config,
        });
      }
    }

    this.singleton = undefined;
    this.transient = [];
  };
}
