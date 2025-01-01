import { ref, container } from "@bunyjs/ioc";
import { it, vi, expect, describe, afterEach, beforeEach } from "vitest";

import { createEvent, createEventScope } from "~/main";

describe("Event", () => {
  beforeEach(async () => {
    await container.bootstrap();
  });

  afterEach(async () => {
    await container.shutdown();
  });

  describe("createEvent", () => {
    it("should create event", async () => {
      const eventSpy = vi.fn();
  
      const testEvent = createEvent("test");
  
      class Test {
        @testEvent()
        test() {
          eventSpy();
        }
  
        @testEvent()
        static test() {
          eventSpy();
        }
      }
  
      await container.register({
        token: Test,
        useClass: Test,
      });
  
      await testEvent.emit(container);
  
      expect(eventSpy).toBeCalledTimes(2);
    });
  
    it("should throw error if event is already registered", async () => {
      const testEvent = createEvent("test");
  
      expect(() => {
        class Test {
          @testEvent()
          @testEvent()
          test() {
          }
        }
      }).toThrowError("Event test is already registered");
    });
  
    it("should emit events in correct order", async () => {
      const firstSpy = vi.fn();
      const secondSpy = vi.fn();
      const thirdSpy = vi.fn();
  
      const event = createEvent("test");
  
      class Second {
        @event()
        test() {
          secondSpy();
        }
      }
  
      class Third {
        @event({
          after: [
            Second,
          ],
        })
        test() {
          thirdSpy();
          expect(firstSpy).toBeCalled();
          expect(secondSpy).toBeCalled();
        }
      }
  
      class First {
        @event({
          before: [
            Third,
            Second,
          ],
        })
        test() {
          firstSpy();
          expect(secondSpy).not.toBeCalled();
          expect(thirdSpy).not.toBeCalled();
        }
      }
  
      await container.register({
        token: First,
        useClass: First,
      });
  
      await container.register({
        token: Second,
        useClass: Second,
      });
  
      await container.register({
        token: Third,
        useClass: Third,
      });
  
      await event.emit(container);
    });
  
    it("should detect circular dependencies", async () => {
      const event = createEvent("test");
  
      class Third {
        @event({
          after: ref(() => Second),
        })
        test() {
        }
      }
  
      class Second {
        @event({
          after: ref(() => First),
        })
        test() {
        }
      }
  
      class First {
        @event({
          after: ref(() => Third),
        })
        test() {
        }
      }
  
      await container.register({
        token: First,
        useClass: First,
      });
  
      await container.register({
        token: Second,
        useClass: Second,
      });
  
      await container.register({
        token: Third,
        useClass: Third,
      });
  
      await expect(event.emit(container)).rejects.toThrowError("Circular dependency detected");
    });
  });

  describe("createEventScope", () => {
    it("should create event", async () => {
      const eventSpy = vi.fn();
  
      const createAppEvent = createEventScope("app");
      const testEvent = createAppEvent("test");
  
      class Test {
        @testEvent()
        test() {
          eventSpy();
        }
  
        @testEvent()
        static test() {
          eventSpy();
        }
      }
  
      await container.register({
        token: Test,
        useClass: Test,
      });
  
      await testEvent.emit(container);
  
      expect(eventSpy).toBeCalledTimes(2);
    });
  });
});
