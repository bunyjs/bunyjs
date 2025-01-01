import { it, expect, describe, afterEach, beforeEach } from "vitest";

import { target, container } from "~/main";

describe("Target", () => {
  beforeEach(async () => {
    await container.bootstrap();
  });

  afterEach(async () => {
    await container.shutdown();
  });

  it("should use target", async () => {
    class Console {
      @target()
      target: string;

      @target()
      static target: string;

      constructor(@target() public ctarget: string) {
      }
    }

    await container.register({
      token: Console,
      useClass: Console,
      target: "file",
    });

    const console = await container.resolve(Console);
    expect(Console.target).toBe("file");
    expect(console.target).toBe("file");
    expect(console.ctarget).toBe("file");
  });
});
