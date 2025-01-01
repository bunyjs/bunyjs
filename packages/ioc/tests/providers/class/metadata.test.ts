import { it, expect, describe } from "vitest";

import { metadata, createMetadata, createMetadataScope } from "~/main";

describe("Metadata", () => {
  describe("Base Metadata Operations", () => {
    it("should set and get metadata", () => {
      class Test { }
      const key = "test:key";
      const value = "test value";

      metadata.setMetadata(key, value, Test);

      expect(metadata.hasMetadata(key, Test)).toBe(true);

      const retrievedValue = metadata.getMetadata(key, Test);
      expect(retrievedValue).toBe(value);
    });

    it("should delete metadata", () => {
      class Test { }
      const key = "test:key";
      const value = "test value";

      // Set metadata
      metadata.setMetadata(key, value, Test);

      // Delete metadata
      const deleteResult = metadata.deleteMetadata(key, Test);
      expect(deleteResult).toBe(true);

      // Check metadata no longer exists
      expect(metadata.hasMetadata(key, Test)).toBe(false);
    });
  });

  describe("Design Metadata", () => {
    it("should handle type metadata", () => {
      class Service { }
      class Test { }

      metadata.setType(Service, Test);

      expect(metadata.hasType(Test)).toBe(true);
      expect(metadata.getType(Test)).toBe(Service);

      metadata.deleteType(Test);
      expect(metadata.hasType(Test)).toBe(false);
    });

    it("should handle parameter types metadata", () => {
      class Service { }
      class Test {
        method(service: Service, name: string) { }
      }

      const paramTypes = [Service, String];

      // Set parameter types
      metadata.setParamTypes(paramTypes, Test, "method");

      // Check parameter types
      expect(metadata.hasParamTypes(Test, "method")).toBe(true);
      expect(metadata.getParamTypes(Test, "method")).toEqual(paramTypes);

      // Delete parameter types
      metadata.deleteParamTypes(Test, "method");
      expect(metadata.hasParamTypes(Test, "method")).toBe(false);
    });

    it("should handle return type metadata", () => {
      class Test {
        method(): number {
          return 0;
        }
      }

      // Set return type
      metadata.setReturnType(Number, Test, "method");

      // Check return type
      expect(metadata.hasReturnType(Test, "method")).toBe(true);
      expect(metadata.getReturnType(Test, "method")).toBe(Number);

      // Delete return type
      metadata.deleteReturnType(Test, "method");
      expect(metadata.hasReturnType(Test, "method")).toBe(false);
    });
  });

  describe("Created Metadata", () => {
    it("should create and use custom metadata", () => {
      class Test { }
      const customMetadata = createMetadata<string>("custom:test");

      customMetadata.set("custom value", Test);

      expect(customMetadata.has(Test)).toBe(true);
      expect(customMetadata.get(Test)).toBe("custom value");

      const deleteResult = customMetadata.delete(Test);
      expect(deleteResult).toBe(true);
      expect(customMetadata.has(Test)).toBe(false);
    });

    it("should use metadata from method", () => {
      class Test {
        method() { }
      }
      const customMetadata = createMetadata<string>("custom:test");

      // Set metadata
      const fromMetadata = customMetadata.from(Test, "method");

      // Set value
      fromMetadata.set("method value");

      // Check value
      expect(fromMetadata.has()).toBe(true);
      expect(fromMetadata.get()).toBe("method value");

      // Get with default
      expect(fromMetadata.get("default")).toBe("method value");

      // Delete metadata
      const deleteResult = fromMetadata.delete();
      expect(deleteResult).toBe(true);
      expect(fromMetadata.has()).toBe(false);
    });
  });

  describe("Metadata Scopes", () => {
    it("should create and use scoped metadata", () => {
      class Test { }
      const createScopedMetadata = createMetadataScope("test:scope");
      const scopedMetadata = createScopedMetadata<number>("test");

      scopedMetadata.set(42, Test);

      expect(scopedMetadata.has(Test)).toBe(true);
      expect(scopedMetadata.get(Test)).toBe(42);

      scopedMetadata.delete(Test);
      expect(scopedMetadata.has(Test)).toBe(false);
    });
  });
});
