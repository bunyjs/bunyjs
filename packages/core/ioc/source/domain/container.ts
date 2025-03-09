import { ClassProvider, ClassRegisterConfig } from "~/providers/class";
import { FactoryProvider, FactoryRegisterConfig } from "~/providers/factory";
import { ValueProvider, ValueRegisterConfig } from "~/providers/value";

import { Emitter } from "./emitter";
import { Provider, ProviderDisposeConfig, ProviderResolveConfig } from "./provider";
import { Store } from "./store";
import { Token, tokenStringify } from "./token";

export type RegisterConfig<T> = ClassRegisterConfig<T> | FactoryRegisterConfig<T> | ValueRegisterConfig<T>;

export enum ContainerState {
  Bootstrapped = "bootstrapped",
  Shutdown = "shutdown",
  Idle = "idle",
}

export class Container extends Emitter {
  store = new Store();

  parent: Container | null = null;
  children: Container[] = [];

  state: ContainerState = ContainerState.Idle;

  createScope() {
    const child = new Container();

    child.parent = this;
    this.children.push(child);

    return child;
  }

  async bootstrap() {
    for (const child of this.children) {
      await child.bootstrap();
    }

    await this.emit("bootstrap", void 0);

    this.state = ContainerState.Bootstrapped;
  }

  async shutdown() {
    await this.emit("shutdown", void 0);

    for (const child of this.children) {
      await child.shutdown();
    }

    await this.disposeAll();

    this.store.clear();

    if (this.parent) {
      this.parent.children = this.parent.children.filter((child) => child !== this);
      this.parent = null;
    }

    this.state = ContainerState.Shutdown;
  }

  //

  bind<T>(token: Token<T>, target: Token<T>) {
    this.store.setBinder(token, target);
  }

  unbind<T>(token: Token<T>) {
    this.store.removeBinder(token);
  }

  //

  async register<T>(config: RegisterConfig<T>) {
    let provider: Provider<T>;

    if ("useClass" in config) {
      provider = new ClassProvider(this, config);
    } else if ("useFactory" in config) {
      provider = new FactoryProvider(this, config);
    } else if ("useValue" in config) {
      provider = new ValueProvider(this, config);
    }

    this.store.setProvider(config.token, provider);

    if (config.alias) {
      this.bind(config.alias, config.token);
    }

    await provider.register();

    await this.emit("register", {
      container: this,
      token: config.token,
      provider,
    });

    return provider;
  }

  isRegistered<T>(token: Token<T>) {
    const provider = this.store.getProvider(token);

    if (provider) {
      return true;
    }

    if (this.parent) {
      return this.parent.isRegistered(token);
    }

    return false;
  }

  //

  async resolve<T>(token: Token<T>, config?: ProviderResolveConfig<T>): Promise<T> {
    const provider = this.store.getProvider(token);

    if (provider) {
      const providers = (Array.isArray(provider) ? provider : [provider]).filter((provider) => {
        return provider.match(config);
      });

      const last = providers.at(-1);

      if (last) {
        const value = await last.resolve(config);

        await this.emit("resolve", {
          container: this,
          provider: last,
          token,
          value,
        });

        return value;
      }
    }

    if (this.parent) {
      return this.parent.resolve(token, config);
    }

    if (config?.fallback) {
      return config.fallback;
    }

    if (config?.optional) {
      return;
    }

    throw new Error(`Provider not found for token: ${tokenStringify(token)}`);
  }

  async resolveAll<T>(token: Token<T>, config?: ProviderResolveConfig<T[]>): Promise<T[]> {
    const provider = this.store.getProvider(token);

    if (provider) {
      const providers = (Array.isArray(provider) ? provider : [provider]).filter((provider) => {
        return provider.match(config);
      });

      return Promise.all(providers.map((provider) => {
        const value = provider.resolve(config);

        this.emit("resolve", {
          container: this,
          provider,
          token,
          value,
        });

        return value;
      }));
    }

    if (this.parent) {
      return this.parent.resolveAll(token, config);
    }

    if (config?.fallback) {
      return config.fallback;
    }

    if (config?.optional) {
      return [];
    }

    throw new Error(`Provider not found for token: ${tokenStringify(token)}`);
  }

  //

  async dispose<T>(token: Token<T>, config?: ProviderDisposeConfig) {
    const provider = this.store.getProvider(token);

    if (provider) {
      const providers = (Array.isArray(provider) ? provider : [provider]).filter((provider) => {
        return provider.match(config);
      });

      await Promise.all(providers.map(async (provider) => {
        await provider.dispose(config);
        await this.emit("dispose", {
          removed: config?.remove,
          container: this,
          provider,
          token,
        });
      }));

      if (config?.remove) {
        this.store.removeProvider(token, providers);
      }
    }
  }

  async disposeAll(config?: ProviderDisposeConfig) {
    const tokens = this.store.tokens();

    for (const token of tokens) {
      await this.dispose(token, config);
    }
  }
}

export const container = new Container();
