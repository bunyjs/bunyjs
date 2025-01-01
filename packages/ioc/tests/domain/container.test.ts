import { it, vi, expect, describe, beforeEach } from "vitest";

import { Container, ContainerState } from "~/main";

describe("Container", () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  describe("lifecycle", () => {
    it("should bootstrap the container", async () => {
      const bootstrapSpy = vi.spyOn(container, "emit");

      await container.bootstrap();

      expect(container.state).toBe(ContainerState.Bootstrapped);
      expect(bootstrapSpy).toHaveBeenCalledWith("bootstrap", void 0);
    });

    it("should shutdown the container", async () => {
      const shutdownSpy = vi.spyOn(container, "emit");

      await container.shutdown();

      expect(container.state).toBe(ContainerState.Shutdown);
      expect(shutdownSpy).toHaveBeenCalledWith("shutdown", void 0);
    });

    it("should create a child container", () => {
      const child = container.createChild();

      expect(child.parent).toBe(container);
      expect(container.children).toContain(child);
    });

    it("should bootstrap the child container", async () => {
      const child = container.createChild();
      const bootstrapSpy = vi.spyOn(child, "bootstrap");

      await container.bootstrap();

      expect(bootstrapSpy).toHaveBeenCalled();
    });

    it("should shutdown the child container and remove it", async () => {
      const child = container.createChild();
      const shutdownSpy = vi.spyOn(child, "shutdown");

      await container.shutdown();

      expect(shutdownSpy).toHaveBeenCalled();
      expect(container.children).not.toContain(child);
      expect(child.parent).toBe(null);
    });
  });

  describe("binding", () => {
    it("should bind a token to a target", async () => {
      await container.register({
        token: "test",
        useValue: "test",
      });

      container.bind("alias", "test");

      expect(container.isRegistered("alias")).toBe(true);
    });

    it("should bind a token to a target with alias", async () => {
      await container.register({
        token: "test",
        useValue: "test",
        alias: "alias",
      });

      expect(container.isRegistered("alias")).toBe(true);
    });

    it("should unbind a token", async () => {
      await container.register({
        token: "test",
        useValue: "test",
        alias: "alias",
      });

      container.unbind("alias");

      expect(container.isRegistered("alias")).toBe(false);
    });
  });

  describe("registration", () => {
    it("should register a class provider", async () => {
      class Test { }

      const registerSpy = vi.spyOn(container, "emit");

      const provider = await container.register({
        token: "test",
        useClass: Test,
      });

      expect(provider).toBeDefined();
      expect(container.isRegistered("test")).toBe(true);
      expect(registerSpy).toHaveBeenCalledWith("register", {
        container,
        provider,
        token: "test",
      });
    });

    it("should register a factory provider", async () => {
      const registerSpy = vi.spyOn(container, "emit");

      const provider = await container.register({
        token: "test",
        useFactory: () => "test",
      });

      expect(provider).toBeDefined();
      expect(container.isRegistered("test")).toBe(true);
      expect(registerSpy).toHaveBeenCalledWith("register", {
        container,
        provider,
        token: "test",
      });
    });

    it("should register a value provider", async () => {
      const registerSpy = vi.spyOn(container, "emit");

      const provider = await container.register({
        token: "test",
        useValue: "test",
      });

      expect(provider).toBeDefined();
      expect(container.isRegistered("test")).toBe(true);
      expect(registerSpy).toHaveBeenCalledWith("register", {
        container,
        provider,
        token: "test",
      });
    });

    it("should throw an error when registering unknown provider", async () => {
      await expect(container.register({} as any)).rejects.toThrowError(
        "Invalid provider config",
      );
    });
  });

  describe("resolving", () => {
    it("should resolve a provider", async () => {
      const resolveSpy = vi.spyOn(container, "emit");

      const provider = await container.register({
        token: "test",
        useValue: "test",
      });

      const value = await container.resolve<string>("test");

      expect(value).toBe("test");
      expect(resolveSpy).toHaveBeenCalledWith("resolve", {
        container,
        provider,
        token: "test",
        value: "test",
      });
    });

    it("should resolve a provider with config", async () => {
      await container.register({
        token: "test",
        useValue: "test1",
        target: "target1",
      });

      await container.register({
        token: "test",
        useValue: "test2",
        target: "target2",
      });

      const target1 = await container.resolve<string>("test", {
        target: "target1",
      });

      expect(target1).toBe("test1");

      const target2 = await container.resolve<string>("test", {
        target: "target2",
      });

      expect(target2).toBe("test2");

      const value = await container.resolve<string>("test");
      expect(value).toBe("test2");

      const values = await container.resolveAll<string>("test");
      expect(values).toEqual(["test1", "test2"]);
    });

    it("should resolve a provider from parent container", async () => {
      const parent = new Container();
      const child = parent.createChild();

      await parent.register({
        token: "test",
        useValue: "test",
      });

      expect(child.isRegistered("test")).toBe(true);

      const value = await child.resolve<string>("test");

      expect(child.isResolved("test")).toBe(true);
      expect(value).toBe("test");
    });

    it("should return fallback value when provider is not found", async () => {
      const value = await container.resolve<string>("test", {
        fallback: "fallback",
      });

      expect(value).toBe("fallback");
    });

    it("should not throw an error when provider is not found", async () => {
      const value = await container.resolve<string>("test", {
        optional: true,
      });

      expect(value).toBe(undefined);
    });

    it("should throw an error when provider is not found", async () => {
      await expect(container.resolve("test")).rejects.toThrowError(
        "Provider not found for token: test",
      );

      expect(() => container.isResolved("test")).toThrowError(
        "Provider not found for token: test",
      );
    });

    it("should resolve the last registered provider", async () => {
      await container.register({
        token: "test",
        useValue: "test1",
      });

      await container.register({
        token: "test",
        useValue: "test2",
      });

      const value = await container.resolve<string>("test");

      expect(value).toBe("test2");
    });

    it("should resolve all providers for a token", async () => {
      await container.register({
        token: "test",
        useValue: "test1",
      });

      await container.register({
        token: "test",
        useValue: "test2",
      });

      const values = await container.resolveAll<string>("test");
      expect(values).toEqual(["test1", "test2"]);
    });

    it("should resolve all providers for a token with fallback", async () => {
      const values = await container.resolveAll<string>("test", {
        fallback: ["fallback1", "fallback2"],
      });

      expect(values).toEqual(["fallback1", "fallback2"]);
    });

    it("should resolve all providers for a token with optional", async () => {
      const values = await container.resolveAll<string>("test", {
        optional: true,
      });

      expect(values).toEqual([]);
    });

    it("should resolve all providers for a token from parent container", async () => {
      const parent = new Container();
      const child = parent.createChild();

      await parent.register({
        token: "test",
        useValue: "test1",
      });

      await parent.register({
        token: "test",
        useValue: "test2",
      });

      const values = await child.resolveAll<string>("test");
      expect(values).toEqual(["test1", "test2"]);
    });

    it("should throw an error when provider is not found for resolveAll", async () => {
      await expect(container.resolveAll("test")).rejects.toThrowError(
        "Provider not found for token: test",
      );
    });
  });

  describe("disposal", () => {
    it("should dispose a provider", async () => {
      const disposeSpy = vi.spyOn(container, "emit");

      const provider = await container.register({
        token: "test",
        useValue: "test",
      });

      await container.dispose("test");

      expect(container.isRegistered("test")).toBe(true);
      expect(container.isDisposed("test")).toBe(true);
      expect(disposeSpy).toHaveBeenCalledWith("dispose", {
        container,
        provider,
        token: "test",
      });
    });

    it("should dispose and remove a provider", async () => {
      const disposeSpy = vi.spyOn(container, "emit");

      const provider = await container.register({
        token: "test",
        useValue: "test",
      });

      await container.dispose("test", {
        remove: true,
      });

      expect(container.isRegistered("test")).toBe(false);
      expect(() => container.isDisposed("test")).toThrowError(
        "Provider not found for token: test",
      );
      expect(disposeSpy).toHaveBeenCalledWith("dispose", {
        container,
        provider,
        token: "test",
        removed: true,
      });
    });

    it("should dispose all providers", async () => {
      const disposeSpy = vi.spyOn(container, "emit");

      await container.register({
        token: "test1",
        useValue: "test1",
      });

      await container.register({
        token: "test2",
        useValue: "test2",
      });

      await container.disposeAll({
        remove: true,
      });

      expect(container.isRegistered("test1")).toBe(false);
      expect(container.isRegistered("test2")).toBe(false);

      expect(disposeSpy).toBeCalledTimes(4);
    });
  });
});
