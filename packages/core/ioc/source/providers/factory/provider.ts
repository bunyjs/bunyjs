import { Scope, Provider, ResolutionConfig } from "~/domain/provider";

import { FactoryRegisterConfig } from "./types";

export class FactoryProvider<T> extends Provider<T> {
  declare config: FactoryRegisterConfig<T>;

  register = () => {
  };

  resolve = async (resolutionConfig?: ResolutionConfig) => {
    const config = this.mergeResolutionConfig(resolutionConfig);

    if (config.scope === Scope.Singleton) {
      if (this.singleton) {
        return this.singleton;
      }
    }

    const value = await this.config.useFactory({
      scope: config.scope,
      target: config.target,
      tags: config.tags,
    });

    if (config.scope === Scope.Singleton) {
      this.singleton = value;
    }

    return value;
  };

  dispose = async () => {
    this.singleton = undefined;
    this.transient = [];
  };
}
