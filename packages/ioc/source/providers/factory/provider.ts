import { Provider, ResolutionConfig } from "~/domain/provider";

import { FactoryScope, FactoryRegisterConfig } from "./types";

export class FactoryProvider<T> extends Provider<T> {
  config: FactoryRegisterConfig<T>;

  singleton: T | null = null;

  resolved: boolean = false;
  disposed: boolean = false;

  async register() {
  }

  async resolve(resolutionConfig?: ResolutionConfig) {
    this.resolved = true;
    this.disposed = false;

    if (this.singleton) {
      return this.singleton;
    }

    const value = await this.config.useFactory({
      tags: this.config.tags,
      target: this.config.target,
      ...resolutionConfig,
    });

    switch (this.config.scope) {
      case FactoryScope.Singleton: {
        this.singleton = value;
        break;
      }
    }

    return value;
  }

  async dispose() {
    this.disposed = true;
    this.resolved = false;
    delete this.singleton;
  }
}
