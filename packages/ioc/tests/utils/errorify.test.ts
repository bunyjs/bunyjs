import { it, expect, describe } from "vitest";

import { errorify } from "~/utils/errorify";

describe("Errorify", () => {
  it("should return message from error", () => {
    const error = new Error("Test error");
    expect(errorify(error)).toBe("Test error");
  });

  it("should return string", () => {
    expect(errorify("Test error")).toBe("Test error");
  });

  it("should return JSON stringified object", () => {
    expect(errorify({ message: "Test error" })).toBe('{"message":"Test error"}');
  });
});
