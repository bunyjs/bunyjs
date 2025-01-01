import { it, expect, describe, beforeEach } from "vitest";

import { Container } from "~/main";

describe("ValueProvider", () => {
  let container: Container;

  beforeEach(async () => {
    container = new Container();
  });

  it("should handle lifecycle of the value provider", async () => {
    await container.register({
      token: "name",
      useValue: "meslzy",
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
});
