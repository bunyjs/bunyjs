import { it, expect, describe } from "vitest";

import { ref, createToken, tokenStringify } from "~/main";

describe("Token", () => {
  describe("createToken", () => {
    it("should create a token from a (string or symbol)", () => {
      const token = createToken("test");
      expect(token).toBe("test");

      const symbolToken = Symbol("test");
      const createdSymbolToken = createToken(symbolToken);
      expect(createdSymbolToken).toBe(symbolToken);
    });

    it("should create a token from a class", () => {
      class TestClass { }
      const token = createToken(TestClass);
      expect(token).toBe(TestClass);
    });

    it("should create a token from a factory", () => {
      const factory = () => "test";
      const token = createToken(factory);
      expect(token).toBe(factory);
    });

    it("should create a token from a ref", () => {
      const test = ref(() => Test);

      class Test {
      }

      const token = createToken(test);

      expect(token).toBe(Test);
    });

    it("should return a new symbol when no token is provided", () => {
      const token = createToken();
      expect(typeof token).toBe("symbol");
    });
  });

  describe("tokenStringify", () => {
    it("should use function name for function tokens", () => {
      function TestFunction() { }
      expect(tokenStringify(TestFunction)).toBe("TestFunction");
    });

    it("should use toString for other token types", () => {
      expect(tokenStringify("test")).toBe("test");
      expect(tokenStringify(Symbol("test"))).toBe("Symbol(test)");
    });
  });
});
