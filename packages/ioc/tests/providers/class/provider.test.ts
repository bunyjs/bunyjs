import { it, vi, expect, describe, afterEach, beforeEach } from "vitest";

import { container, ClassScope, disposersMetadata, registersMetadata, resolversMetadata, parametersMetadata, propertiesMetadata } from "~/main";

const decorator = (target: any, propertyKey?: any, descriptor?: any) => {
};

describe("ClassProvider", () => {
  beforeEach(async () => {
    await container.bootstrap();
  });

  afterEach(async () => {
    await container.shutdown();
  });

  describe("register", () => {
    it("should register class provider", async () => {
      class Mock {
      }

      const provider = await container.register({
        token: Mock,
        useClass: Mock,
      });

      expect(provider).toBeDefined();
      expect(container.isRegistered(Mock)).toBe(true);
    });

    it("should emit register events", async () => {
      const registerHandler = vi.fn();

      class Mock {
      }

      registersMetadata.set([{
        handler: registerHandler,
      }], Mock);

      const provider = await container.register({
        token: Mock,
        useClass: Mock,
      });

      expect(registerHandler).toBeCalledWith({
        container,
        provider,
      });
    });
  });

  describe("resolve", () => {
    it("should resolve class provider with singleton scope by default", async () => {
      class Service {
      }

      class Mock {
        constructor(@decorator public service: Service) {
        }
      }

      await container.register({
        token: Service,
        useClass: Service,
      });

      await container.register({
        token: Mock,
        useClass: Mock,
      });

      const mock1 = await container.resolve(Mock);
      const mock2 = await container.resolve(Mock);
      expect(mock1).toBe(mock2);
      expect(mock1.service).toBe(mock2.service);
    });

    it("should resolve class provider with transient scope", async () => {
      class Service {
      }

      class Mock {
        constructor(@decorator public service: Service) {
        }
      }

      await container.register({
        token: Service,
        useClass: Service,
        scope: ClassScope.Transient,
      });

      await container.register({
        token: Mock,
        useClass: Mock,
        scope: ClassScope.Transient,
      });

      const mock1 = await container.resolve(Mock);
      const mock2 = await container.resolve(Mock);
      expect(mock1).not.toBe(mock2);
      expect(mock1.service).not.toBe(mock2.service);
    });

    it("should emit static properties events", async () => {
      const resolveHandler = vi.fn(() => {
        return "test";
      });

      class Mock {
        static test: string;
      }

      const metadata = propertiesMetadata.from(Mock);

      metadata.set([
        {
          propertyKey: "test",
          handler: resolveHandler,
        },
      ]);

      await container.register({
        token: Mock,
        useClass: Mock,
      });

      const instance = await container.resolve(Mock);

      expect(instance).toBeInstanceOf(Mock);
      expect(Mock.test).toBe("test");
      expect(resolveHandler).toBeCalledWith({
        container,
      });
    });

    it("should emit instance properties events", async () => {
      const resolveHandler = vi.fn(() => {
        return "test";
      });

      class Mock {
        test: string;
      }

      const metadata = propertiesMetadata.from(Mock.prototype);

      metadata.set([
        {
          propertyKey: "test",
          handler: resolveHandler,
        },
      ]);

      await container.register({
        token: Mock,
        useClass: Mock,
      });

      const instance = await container.resolve(Mock);

      expect(instance).toBeInstanceOf(Mock);
      expect(instance.test).toBe("test");
      expect(resolveHandler).toBeCalledWith({
        container,
      });
    });

    it("should emit constructor parameters events", async () => {
      const resolveHandler = vi.fn(() => {
        return "test";
      });

      class Mock {
        constructor(@decorator public test: string) {
        }
      }

      const metadata = parametersMetadata.from(Mock, undefined);

      metadata.set([
        {
          index: 0,
          handler: resolveHandler,
        },
      ]);

      await container.register({
        token: Mock,
        useClass: Mock,
      });

      const instance = await container.resolve(Mock);

      expect(instance).toBeInstanceOf(Mock);
      expect(instance.test).toBe("test");
      expect(resolveHandler).toBeCalledWith({
        container,
      });
    });

    it("should emit static resolvers events", async () => {
      const resolveHandler = vi.fn();

      class Mock {
      }

      const metadata = resolversMetadata.from(Mock);

      metadata.set([
        {
          handler: resolveHandler,
        },
      ]);

      const provider = await container.register({
        token: Mock,
        useClass: Mock,
      });

      const instance = await container.resolve(Mock);

      expect(instance).toBeInstanceOf(Mock);
      expect(resolveHandler).toBeCalledWith({
        container,
        provider,
        instance,
      });
    });

    it("should emit instance resolvers events", async () => {
      const resolveHandler = vi.fn();

      class Mock {
      }

      const metadata = resolversMetadata.from(Mock.prototype);

      metadata.set([
        {
          handler: resolveHandler,
        },
      ]);

      const provider = await container.register({
        token: Mock,
        useClass: Mock,
      });

      const instance = await container.resolve(Mock);

      expect(instance).toBeInstanceOf(Mock);
      expect(resolveHandler).toBeCalledWith({
        container,
        provider,
        instance,
      });
    });
  });

  describe("dispose", () => {
    it("should dispose class provider", async () => {
      class Mock {
      }

      const provider = await container.register({
        token: Mock,
        useClass: Mock,
      });

      const mock1 = await container.resolve(Mock);
      await container.dispose(Mock);

      expect(provider.disposed).toBe(true);
      expect(provider.resolved).toBe(false);

      const mock2 = await container.resolve(Mock);
      expect(mock1).not.toBe(mock2);
    });

    it("should emit instance disposers events", async () => {
      const disposeHandler = vi.fn();

      class Mock {
      }

      const metadata = disposersMetadata.from(Mock.prototype);

      metadata.set([
        {
          handler: disposeHandler,
        },
      ]);

      const provider = await container.register({
        token: Mock,
        useClass: Mock,
      });

      const instance = await container.resolve(Mock);
      await container.dispose(Mock);

      expect(disposeHandler).toBeCalledWith({
        container,
        provider,
        instance,
      });
    });

    it("should emit static disposers events", async () => {
      const disposeHandler = vi.fn();

      class Mock {
      }

      const metadata = disposersMetadata.from(Mock);

      metadata.set([
        {
          handler: disposeHandler,
        },
      ]);

      const provider = await container.register({
        token: Mock,
        useClass: Mock,
      });

      const instance = await container.resolve(Mock);
      await container.dispose(Mock);

      expect(disposeHandler).toBeCalledWith({
        container,
        provider,
        instance,
      });
    });
  });
});
