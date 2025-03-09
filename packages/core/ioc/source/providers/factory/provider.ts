import { Lifetime, Provider, ResolutionConfig } from "~/domain/provider";

import { FactoryRegisterConfig } from "./types";

export class FactoryProvider<T> extends Provider<T> {
  declare config: FactoryRegisterConfig<T>;

  singleton: T | null = null;
  transient: T[] = [];

  register = () => {
  };

  resolve = async (resolutionConfig?: ResolutionConfig) => {
    const config = this.mergeResolutionConfig(resolutionConfig);

    if (config.lifetime === Lifetime.Singleton) {
      if (this.singleton) {
        return this.singleton;
      }
    }

    const value = await this.config.useFactory({
      ...config,
    });

    if (config.lifetime === Lifetime.Singleton) {
      this.singleton = value;
    } else if (config.lifetime === Lifetime.Transient) {
      this.transient.push(value);
    }

    return value;
  };

  dispose = async () => {
    this.singleton = null;
    this.transient = [];
  };
}
