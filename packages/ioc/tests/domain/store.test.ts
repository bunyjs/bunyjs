import { it, expect, describe, beforeEach } from "vitest";

import { Store, Token, Provider, PointerType, tokenStringify } from "~/main";

class MockProvider extends Provider {
  resolved = false;
  disposed = false;
  config: any;

  register() {
    return Promise.resolve();
  }

  resolve() {
    return Promise.resolve({});
  }

  dispose() {
    return Promise.resolve();
  }
}

describe("Store", () => {
  let store: Store;
  let token1: Token<string>;
  let token2: Token<number>;
  let provider1: MockProvider;
  let provider2: MockProvider;

  beforeEach(() => {
    store = new Store();
    token1 = Symbol("token1") as Token<string>;
    token2 = Symbol("token2") as Token<number>;
    provider1 = new MockProvider();
    provider2 = new MockProvider();
  });

  describe("setProvider", () => {
    it("should set a single provider for a token", () => {
      store.setProvider(token1, provider1);
      const provider = store.getProvider(token1);
      expect(provider).toEqual(provider1);
    });

    it("should allow multiple providers for a token", () => {
      store.setProvider(token1, provider1);
      store.setProvider(token1, provider2);
      const providers = store.getProvider(token1);
      expect(providers).toEqual([provider1, provider2]);
    });

    it("should throw an error when attempting to set a binding as a provider", () => {
      store.setBinder(token1, token2);
      expect(() => store.setProvider(token1, provider1)).toThrowError(
        `Provider already registered for token: ${tokenStringify(token1)} as ${PointerType.Binding}`,
      );
    });
  });

  describe("getProvider", () => {
    it("should return null for an unregistered token", () => {
      const provider = store.getProvider(token1);
      expect(provider).toBeNull();
    });

    it("should return the correct provider for a directly registered token", () => {
      store.setProvider(token1, provider1);
      const providers = store.getProvider(token1);
      expect(providers).toEqual(provider1);
    });

    it("should resolve providers through bindings", () => {
      store.setProvider(token2, provider1);
      store.setBinder(token1, token2);
      const providers = store.getProvider(token1);
      expect(providers).toEqual([provider1]);
    });

    it("should handle multiple bindings", () => {
      const token3 = Symbol("token3") as Token<number>;
      store.setProvider(token2, provider1);
      store.setProvider(token3, provider2);
      store.setBinder(token1, [token2, token3]);
      const providers = store.getProvider(token1);
      expect(providers).toEqual([provider1, provider2]);
    });

    it("should throw an error for invalid pointers", () => {
      store.map.set(token1, { type: "invalid" } as any);
      expect(() => store.getProvider(token1)).toThrowError(
        `Invalid pointer type for token: ${tokenStringify(token1)}`,
      );
    });
  });

  describe("removeProvider", () => {
    it("should remove a specific provider", () => {
      store.setProvider(token1, provider1);
      store.setProvider(token1, provider2);
      store.removeProvider(token1, provider1);
      const providers = store.getProvider(token1);
      expect(providers).toEqual([provider2]);
    });

    it("should remove all providers if no specific provider is specified", () => {
      store.setProvider(token1, provider1);
      store.setProvider(token1, provider2);
      store.removeProvider(token1);
      const providers = store.getProvider(token1);
      expect(providers).toBeNull();
    });

    it("should remove providers through bindings", () => {
      store.setProvider(token2, provider1);
      store.setBinder(token1, token2);
      store.removeProvider(token1, provider1);
      const providers = store.getProvider(token2);
      expect(providers).toBeNull();
    });

    it("should do nothing if the token does not exist", () => {
      expect(() => store.removeProvider(token1, provider1)).not.toThrow();
    });

    it("should remove the pointer if the provider list becomes empty", () => {
      store.setProvider(token1, provider1);
      store.setProvider(token1, provider2);
      store.removeProvider(token1, provider1);
      store.removeProvider(token1, provider2);
      const pointer = store.map.get(token1);
      expect(pointer).toBeUndefined();
    });

    it("should throw an error if the pointer type is invalid", () => {
      store.map.set(token1, { type: "invalid" } as any);
      expect(() => store.removeProvider(token1, provider1)).toThrowError(
        `Invalid pointer type for token: ${tokenStringify(token1)}`,
      );
    });
  });

  describe("setBinder", () => {
    it("should set a single binding for a token", () => {
      store.setBinder(token1, token2);
      const pointer = store.map.get(token1);
      expect(pointer).toEqual({
        type: PointerType.Binding,
        binding: token2,
      });
    });

    it("should allow multiple bindings for a token", () => {
      const tokenA = "tokenA" as Token<string>;
      const tokenB = "tokenB" as Token<string>;

      store.setBinder(token1, tokenA);
      store.setBinder(token1, tokenB);

      const pointer = store.map.get(token1);
      expect(pointer).toEqual({
        type: PointerType.Binding,
        binding: [tokenA, tokenB],
      });
    });

    it("should throw an error when attempting to set a provider as a binding", () => {
      store.setProvider(token1, provider1);
      expect(() => store.setBinder(token1, token2)).toThrowError(
        `Binding already registered for token: ${tokenStringify(token1)} as ${PointerType.Provider}`,
      );
    });
  });

  describe("removeBinder", () => {
    it("should remove the binding for a token", () => {
      store.setBinder(token1, token2);
      store.removeBinder(token1);
      const pointer = store.map.get(token1);
      expect(pointer).toBeUndefined();
    });

    it("should throw an error when attempting to remove a non-binding", () => {
      store.setProvider(token1, provider1);
      expect(() => store.removeBinder(token1)).toThrowError(
        `Cannot remove binding for token: ${tokenStringify(token1)} as ${PointerType.Provider}`,
      );
    });

    it("should do nothing if the binding does not exist", () => {
      expect(() => store.removeBinder(token1)).not.toThrow();
    });
  });

  describe("clear", () => {
    it("should remove all entries from the store", () => {
      store.setProvider(token1, provider1);
      store.setBinder(token2, token1);
      store.clear();
      expect(store.tokens()).toHaveLength(0);
    });
  });

  describe("tokens", () => {
    it("should return all tokens in the store", () => {
      store.setProvider(token1, provider1);
      store.setBinder(token2, token1);
      const tokens = store.tokens();
      expect(tokens).toContain(token1);
      expect(tokens).toContain(token2);
      expect(tokens).toHaveLength(2);
    });
  });
});
