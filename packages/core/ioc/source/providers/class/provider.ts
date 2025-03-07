import { Scope, Provider, ResolutionConfig } from "~/domain/provider";
import { metadata } from "~/main";

import { disposersMetadata, registersMetadata, resolversMetadata, parametersMetadata, propertiesMetadata } from "./metadata";
import { ClassRegisterConfig } from "./types";

export class ClassProvider<T> extends Provider<T> {
  declare config: ClassRegisterConfig<T>;

  register = async () => {
    const config = this.mergeResolutionConfig();

    const constructor = this.config.useClass;

    const staticProperties = propertiesMetadata.get(constructor) || [];

    for (const property of staticProperties) {
      constructor[property.propertyKey] = await property.handler({
        container: this.container,
        scope: config.scope,
        tags: config.tags,
        target: config.target,
      });
    }

    const staticRegisters = registersMetadata.get(constructor) || [];

    for (const register of staticRegisters) {
      await register.handler({
        container: this.container,
        provider: this,
        scope: config.scope,
        tags: config.tags,
        target: config.target,
      });
    }
  };

  resolve = async (resolutionConfig?: ResolutionConfig) => {
    const config = this.mergeResolutionConfig(resolutionConfig);

    const constructor = this.config.useClass;

    if (config.scope === Scope.Singleton) {
      if (this.singleton) {
        return this.singleton;
      }
    }

    const args: unknown[] = [];

    const constructorParameters = parametersMetadata.get(constructor) || [];

    for (const parameter of constructorParameters) {
      args[parameter.index] = await parameter.handler({
        container: this.container,
        scope: config.scope,
        tags: config.tags,
        target: config.target,
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
          scope: config.scope,
          tags: config.tags,
          target: config.target,
        });
      }
    }

    const instance = new constructor(...args);

    const instanceProperties = propertiesMetadata.get(instance) || [];

    for (const property of instanceProperties) {
      instance[property.propertyKey] = await property.handler({
        container: this.container,
        scope: config.scope,
        tags: config.tags,
        target: config.target,
      });
    }

    const staticResolvers = resolversMetadata.get(constructor) || [];

    for (const resolver of staticResolvers) {
      await resolver.handler({
        instance,
        provider: this,
        container: this.container,
        scope: config.scope,
        tags: config.tags,
        target: config.target,
      });
    }

    const instanceResolvers = resolversMetadata.get(instance) || [];

    for (const resolver of instanceResolvers) {
      await resolver.handler({
        instance,
        provider: this,
        container: this.container,
        scope: config.scope,
        tags: config.tags,
        target: config.target,
      });
    }

    switch (config.scope) {
      case Scope.Singleton: {
        this.singleton = instance;
        break;
      }
      case Scope.Transient: {
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
      const instanceDisposers = disposersMetadata.get(instance) || [];

      for (const disposer of instanceDisposers) {
        await disposer.handler({
          instance,
          provider: this,
          container: this.container,
          scope: config.scope,
          tags: config.tags,
          target: config.target,
        });
      }

      const staticDisposers = disposersMetadata.get(constructor) || [];

      for (const disposer of staticDisposers) {
        await disposer.handler({
          instance,
          provider: this,
          container: this.container,
          scope: config.scope,
          tags: config.tags,
          target: config.target,
        });
      }
    }

    this.singleton = undefined;
    this.transient = [];
  };
}
