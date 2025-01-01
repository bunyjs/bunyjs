import { Provider, ResolutionConfig } from "~/domain/provider";
import { metadata } from "~/main";

import { disposersMetadata, registersMetadata, resolversMetadata, parametersMetadata, propertiesMetadata } from "./metadata";
import { ClassScope, ClassRegisterConfig } from "./types";

export class ClassProvider<T> extends Provider<T> {
  config: ClassRegisterConfig<T>;

  private singleton: T | null = null;
  private transient: T[] = [];

  resolved: boolean = false;
  disposed: boolean = false;

  async register() {
    const constructor = this.config.useClass;

    const staticRegisters = registersMetadata.get(constructor) || [];

    for (const register of staticRegisters) {
      await register.handler({
        container: this.container,
        provider: this,
        tags: this.config.tags,
        target: this.config.target,
      });
    }
  }

  async resolve(resolutionConfig?: ResolutionConfig) {
    this.resolved = true;
    this.disposed = false;

    if (this.singleton) {
      return this.singleton;
    }

    const constructor = this.config.useClass;

    const staticProperties = propertiesMetadata.get(constructor) || [];

    for (const property of staticProperties) {
      constructor[property.propertyKey] = await property.handler({
        container: this.container,
        tags: this.config.tags,
        target: this.config.target,
        ...resolutionConfig,
      });
    }

    const args: unknown[] = [];

    const constructorParameters = parametersMetadata.get(constructor) || [];

    for (const parameter of constructorParameters) {
      args[parameter.index] = await parameter.handler({
        container: this.container,
        tags: this.config.tags,
        target: this.config.target,
        ...resolutionConfig,
      });
    }

    const constructorParamTypes = metadata.getParamTypes(constructor) || [];

    for (const [i, paramType] of constructorParamTypes.entries()) {
      if (constructorParameters.some((x) => x.index === i)) {
        continue;
      }

      if (paramType) {
        args[i] = await this.container.resolve(paramType, {
          optional: true,
          tags: this.config.tags,
          target: this.config.target,
          ...resolutionConfig,
        });
      }
    }

    const instance = new constructor(...args);
    
    const instanceProperties = propertiesMetadata.get(instance) || [];

    for (const property of instanceProperties) {
      instance[property.propertyKey] = await property.handler({
        container: this.container,
        tags: this.config.tags,
        target: this.config.target,
        ...resolutionConfig,
      });
    }

    const staticResolvers = resolversMetadata.get(constructor) || [];

    for (const resolver of staticResolvers) {
      await resolver.handler({
        instance,
        provider: this,
        container: this.container,
        tags: this.config.tags,
        target: this.config.target,
        ...resolutionConfig,
      });
    }

    const instanceResolvers = resolversMetadata.get(instance) || [];

    for (const resolver of instanceResolvers) {
      await resolver.handler({
        instance,
        provider: this,
        container: this.container,
        tags: this.config.tags,
        target: this.config.target,
        ...resolutionConfig,
      });
    }

    switch (this.config.scope) {
      case ClassScope.Transient: {
        this.transient.push(instance);
        break;
      }
      default: {
        this.singleton = instance;
        break;
      }
    }

    return instance;
  }

  async dispose(resolutionConfig?: ResolutionConfig) {
    this.disposed = true;
    this.resolved = false;

    const instances = [...this.transient];

    if (this.singleton) {
      instances.push(this.singleton);
    }

    const constructor = this.config.useClass;

    for (const instance of instances) {
      const instanceDisposers = disposersMetadata.get(instance) || [];

      for (const disposer of instanceDisposers) {
        await disposer.handler({
          instance,
          provider: this,
          container: this.container,
          tags: this.config.tags,
          target: this.config.target,
          ...resolutionConfig,
        });
      }

      const staticDisposers = disposersMetadata.get(constructor) || [];

      for (const disposer of staticDisposers) {
        await disposer.handler({
          instance,
          provider: this,
          container: this.container,
          tags: this.config.tags,
          target: this.config.target,
          ...resolutionConfig,
        });
      }
    }

    this.singleton = null;
    this.transient = [];
  }
}
