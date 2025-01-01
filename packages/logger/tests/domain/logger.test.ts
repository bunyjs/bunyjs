import { container } from "@bunyjs/ioc";
import { it, expect, describe, afterEach, beforeEach } from "vitest";

import { Logger } from "~/main";


describe("Logger", () => {
  beforeEach(async () => {
    await container.bootstrap();
  });

  afterEach(async () => {
    await container.shutdown();
  });

  it("should create logger", async () => {
    const logger = await container.resolve(Logger);
    expect(logger).toBeInstanceOf(Logger);
  });
});
