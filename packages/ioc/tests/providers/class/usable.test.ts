import { afterEach } from "node:test";

import { it, expect, describe } from "vitest";

import { usable, container, dependenciesMetadata } from "~/main";

describe("Usable", () => {
  afterEach(async () => {
    await container.shutdown();
  });

  it("should register class provider", async () => {
    @usable()
    class Name {
    }

    await container.bootstrap();

    const name = await container.resolve(Name);
    expect(name).toBeInstanceOf(Name);
  });

  it("should register class provider with dependencies", async () => {
    class Dependency {
    }

    @usable({
      dependency: [
        Dependency,
      ],
    })
    class Name {
    }

    await container.bootstrap();

    const name = await container.resolve(Name);
    expect(name).toBeInstanceOf(Name);

    const dependencies = dependenciesMetadata.get(Name);
    expect(dependencies).toEqual([Dependency]);
  });
});
