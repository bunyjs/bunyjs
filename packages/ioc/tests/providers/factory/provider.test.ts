import { it, expect, describe, beforeEach } from "vitest";

import { Container, FactoryScope } from "~/main";

describe("FactoryProvider", () => {
  let container: Container;

  beforeEach(async () => {
    container = new Container();
  });

  it("should handle lifecycle of the factory provider", async () => {
    await container.register({
      token: "name",
      useFactory: () => "meslzy",
    });

    const nameRegistered = container.isRegistered("name");
    expect(nameRegistered).toBe(true);

    const name = await container.resolve("name");
    expect(name).toBe("meslzy");
    const nameResolved = container.isResolved("name");
    expect(nameResolved).toBe(true);

    await container.dispose("name");
    const nameDisposed = container.isDisposed("name");
    expect(nameDisposed).toBe(true);
  });

  it("should handle factory provider with singleton scope", async () => {
    await container.register({
      token: "random",
      useFactory: () => Math.random(),
      scope: FactoryScope.Singleton,
    });

    const random1 = await container.resolve("random");
    const random2 = await container.resolve("random");

    expect(random1).toBe(random2);
  });

  it("should handle factory provider with transient scope", async () => {
    await container.register({
      token: "random",
      useFactory: () => Math.random(),
      scope: FactoryScope.Transient,
    });

    const random1 = await container.resolve("random");
    const random2 = await container.resolve("random");

    expect(random1).not.toBe(random2);
  });

  it("should pass target to factory provider context", async () => {
    await container.register({
      token: "logger",
      useFactory: ({ target }) => `Logger for ${String(target)}`,
    });

    const fileLogger = await container.resolve("logger", {
      target: "file",
    });

    expect(fileLogger).toBe("Logger for file");
  });

  it("should pass tags to factory provider context", async () => {
    await container.register({
      token: "logger",
      useFactory: ({ tags }) => `Logger for ${tags.type}`,
    });

    const fileLogger = await container.resolve("logger", {
      tags: {
        type: "file",
      },
    });

    expect(fileLogger).toBe("Logger for file");
  });
});
