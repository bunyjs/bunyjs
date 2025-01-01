import { it, expect, describe } from "vitest";

import { Provider, ProviderRegisterConfig } from "~/main";

class MockProvider extends Provider<string> {
  resolved = false;
  disposed = false;
  config: ProviderRegisterConfig;

  constructor(config: ProviderRegisterConfig) {
    super();
    this.config = config;
  }

  register(): Promise<void> {
    return Promise.resolve();
  }

  resolve(): Promise<string> {
    this.resolved = true;
    return Promise.resolve("test-value");
  }

  dispose(): Promise<void> {
    this.disposed = true;
    return Promise.resolve();
  }
}

describe("Provider", () => {
  describe("match method", () => {
    describe("tag matching", () => {
      it("should match when no tags are provided", () => {
        const provider = new MockProvider({
          token: Symbol("test"),
          tags: { env: "production" },
        });

        expect(provider.match()).toBe(true);
      });

      it("should match when provider has no tags", () => {
        const provider = new MockProvider({
          token: Symbol("test"),
        });

        expect(provider.match({ tags: { env: "production" } })).toBe(true);
      });

      it("should match when all specified tags match", () => {
        const provider = new MockProvider({
          token: Symbol("test"),
          tags: {
            env: "production",
            type: "app",
          },
        });

        expect(provider.match({
          tags: {
            env: "production",
          },
        })).toBe(true);
      });

      it("should not match when any tag does not match", () => {
        const provider = new MockProvider({
          token: Symbol("test"),
          tags: {
            env: "production",
            type: "app",
          },
        });

        expect(provider.match({
          tags: {
            env: "development",
          },
        })).toBe(false);
      });

      it("should match all tags when multiple tags are provided", () => {
        const provider = new MockProvider({
          token: Symbol("test"),
          tags: {
            env: "production",
            type: "app",
          },
        });

        expect(provider.match({
          tags: {
            env: "production",
            type: "app",
          },
        })).toBe(true);
      });
    });

    describe("target matching", () => {
      it("should match when no target is provided", () => {
        const provider = new MockProvider({
          token: Symbol("test"),
          target: "service",
        });

        expect(provider.match()).toBe(true);
      });

      it("should match when provider has no target", () => {
        const provider = new MockProvider({
          token: Symbol("test"),
        });

        expect(provider.match({ target: "service" })).toBe(true);
      });

      it("should match when targets are exactly the same", () => {
        const target = Symbol("service");
        const provider = new MockProvider({
          token: Symbol("test"),
          target,
        });

        expect(provider.match({ target })).toBe(true);
      });

      it("should not match when targets differ", () => {
        const provider = new MockProvider({
          token: Symbol("test"),
          target: Symbol("service1"),
        });

        expect(provider.match({ target: Symbol("service2") })).toBe(false);
      });
    });

    describe("combined matching", () => {
      it("should match when both tags and target match", () => {
        const target = Symbol("service");
        const provider = new MockProvider({
          token: Symbol("test"),
          target,
          tags: {
            env: "production",
            type: "app",
          },
        });

        expect(provider.match({
          target,
          tags: {
            env: "production",
            type: "app",
          },
        })).toBe(true);
      });

      it("should not match when either tags or target do not match", () => {
        const target = Symbol("service");
        const provider = new MockProvider({
          token: Symbol("test"),
          target,
          tags: {
            env: "production",
            type: "app",
          },
        });

        expect(provider.match({
          target: Symbol("other-service"),
          tags: {
            env: "production",
            type: "app",
          },
        })).toBe(false);

        expect(provider.match({
          target,
          tags: {
            env: "development",
            type: "app",
          },
        })).toBe(false);
      });
    });
  });
});
