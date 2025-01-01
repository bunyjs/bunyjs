import { it, vi, expect, describe } from "vitest";

import { combine, createDecorator } from "~/main";


describe("Combine", () => {
  it("should combine decorators", () => {
    const test1Spy = vi.fn();

    const test1 = createDecorator("test1", () => ({
      onInit: test1Spy,
    }));

    const test2Spy = vi.fn();

    const test2 = createDecorator("test2", () => ({
      onInit: test2Spy,
    }));


    @combine(
      test1(),
      test2(),
    )
    class Test {
    }

    expect(test1Spy).toBeCalledTimes(1);
    expect(test2Spy).toBeCalledTimes(1);
  });
});
