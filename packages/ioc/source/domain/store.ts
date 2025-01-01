import { Provider } from "./provider";
import { Token, tokenStringify } from "./token";

export enum PointerType {
  Provider = "PROVIDER",
  Binding = "BINDING",
}

export interface Pointer {
  type: PointerType;
}

export interface ProviderPointer extends Pointer {
  type: PointerType.Provider;
  provider: Provider<unknown> | Provider<unknown>[];
}

export interface BindingPointer extends Pointer {
  type: PointerType.Binding;
  binding: Token | Token[];
}

export class Store {
  map = new Map<Token, (ProviderPointer | BindingPointer)>();

  clear() {
    this.map.clear();
  }

  tokens() {
    return Array.from(this.map.keys());
  }

  //

  setProvider(token: Token, provider: Provider) {
    const pointer = this.map.get(token);

    if (!pointer) {
      this.map.set(token, {
        type: PointerType.Provider,
        provider,
      });

      return;
    }

    if (pointer.type === PointerType.Provider) {
      const providers = Array.isArray(pointer.provider) ? pointer.provider : [pointer.provider];

      this.map.set(token, {
        type: PointerType.Provider,
        provider: providers.concat(provider),
      });

      return;
    }

    throw new Error(`Provider already registered for token: ${tokenStringify(token)} as ${pointer.type}`);
  }

  getProvider<T>(token: Token<T>): Provider<T> | Provider<T>[] | null {
    const pointer = this.map.get(token);

    if (!pointer) {
      return null;
    }

    if (pointer.type === PointerType.Provider) {
      return pointer.provider as Provider<T> | Provider<T>[];
    }

    if (pointer.type === PointerType.Binding) {
      const bindings = Array.isArray(pointer.binding) ? pointer.binding : [pointer.binding];
      const providers = bindings.map((binding) => this.getProvider(binding)).flat();
      return providers as Provider<T>[];
    }

    throw new Error(`Invalid pointer type for token: ${tokenStringify(token)}`);
  }

  removeProvider(token: Token, provider?: Provider | Provider[]) {
    const pointer = this.map.get(token);

    if (!pointer) {
      return;
    }

    if (pointer.type === PointerType.Provider) {
      if (!provider) {
        this.map.delete(token);
        return;
      }

      const providers = Array.isArray(provider) ? provider : [provider];

      if (Array.isArray(pointer.provider)) {
        const filteredProviders = pointer.provider.filter((p) => !providers.includes(p));

        if (filteredProviders.length === 0) {
          this.map.delete(token);
          return;
        }

        this.map.set(token, {
          type: PointerType.Provider,
          provider: filteredProviders,
        });

        return;
      }

      if (providers.includes(pointer.provider)) {
        this.map.delete(token);
      }

      return;
    }

    if (pointer.type === PointerType.Binding) {
      const bindings = Array.isArray(pointer.binding) ? pointer.binding : [pointer.binding];
      for (const binding of bindings) this.removeProvider(binding, provider);
      return;
    }

    throw new Error(`Invalid pointer type for token: ${tokenStringify(token)}`);
  }

  //

  setBinder(token: Token, binding: Token | Token[]) {
    const pointer = this.map.get(token);

    if (!pointer) {
      this.map.set(token, {
        type: PointerType.Binding,
        binding,
      });

      return;
    }

    if (pointer.type === PointerType.Binding) {
      const bindings = Array.isArray(pointer.binding) ? pointer.binding : [pointer.binding];

      this.map.set(token, {
        type: PointerType.Binding,
        binding: bindings.concat(binding),
      });

      return;
    }

    throw new Error(`Binding already registered for token: ${tokenStringify(token)} as ${pointer.type}`);
  }

  removeBinder(token: Token) {
    const pointer = this.map.get(token);

    if (!pointer) {
      return;
    }

    if (pointer.type === PointerType.Binding) {
      this.map.delete(token);
      return;
    }

    throw new Error(`Cannot remove binding for token: ${tokenStringify(token)} as ${pointer.type}`);
  }
}
