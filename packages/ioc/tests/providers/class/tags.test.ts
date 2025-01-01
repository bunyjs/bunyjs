import { it, expect, describe, afterEach, beforeEach } from "vitest";

import { tags, container } from "~/main";

describe("Tags", () => {
  beforeEach(async () => {
    await container.bootstrap();
  });

  afterEach(async () => {
    await container.shutdown();
  });

  it("should use tags", async () => {
    class Test {
      @tags("name")
      name: string;

      @tags("name")
      static name: string;

      @tags()
      tags: Record<string, any>;

      @tags()
      static tags: Record<string, any>;

      constructor(@tags("name") public cname: string, @tags() public ctags: Record<string, any>) {
      }
    }

    await container.register({
      token: Test,
      useClass: Test,
      tags: { name: "john" },
    });

    const test = await container.resolve(Test);
    expect(Test.name).toBe("john");
    expect(test.name).toBe("john");

    expect(Test.tags).toEqual({ name: "john" });
    expect(test.tags).toEqual({ name: "john" });

    expect(test.cname).toBe("john");
    expect(test.ctags).toEqual({ name: "john" });
  });
});
