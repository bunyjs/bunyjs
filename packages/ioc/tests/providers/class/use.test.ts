import { afterEach } from "node:test";

import { it, expect, describe, beforeEach } from "vitest";

import { use, container } from "~/main";

describe("Use", () => {
  beforeEach(async () => {
    await container.bootstrap();
  });

  afterEach(async () => {
    await container.shutdown();
  });

  it("should resolve property", async () => {
    class Dependency {
    }

    class Name {
      @use()
      dependency1: Dependency;

      @use(Dependency)
      dependency2: Dependency;

      @use({
        token: Dependency,
      })
      dependency3: Dependency;

      @use()
      static dependency: Dependency;
    }

    await container.register({
      token: Dependency,
      useClass: Dependency,
    });

    await container.register({
      token: Name,
      useClass: Name,
    });

    const name = await container.resolve(Name);
    expect(Name.dependency).toBeInstanceOf(Dependency);
    expect(name.dependency1).toBeInstanceOf(Dependency);
    expect(name.dependency2).toBeInstanceOf(Dependency);
    expect(name.dependency3).toBeInstanceOf(Dependency);
  });

  it("should throw error if property is untokenized", async () => {
    expect(() => {
      class Name {
        @use()
        property: undefined;
      }
    }).toThrowError();

    expect(() => {
      class Name {
        @use()
        static property: undefined;
      }
    }).toThrowError();
  });

  it("should resolve parameter", async () => {
    class Dependency {
    }

    class Name {
      constructor(@use() public dependency: Dependency) {
      }
    }

    await container.register({
      token: Dependency,
      useClass: Dependency,
    });

    await container.register({
      token: Name,
      useClass: Name,
    });

    const name = await container.resolve(Name);
    expect(name.dependency).toBeInstanceOf(Dependency);
  });

  it("should throw error if parameter is untokenized", async () => {
    expect(() => {
      class Name {
        constructor(@use() public property: undefined) {
        }
      }
    }).toThrowError();
  });
});
