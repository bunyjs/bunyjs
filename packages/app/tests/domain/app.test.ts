import { usable, container, ContainerState } from "@bunyjs/ioc";
import { it, vi, expect, describe, afterEach } from "vitest";

import { App, init, start, AppState, shutdown, bootstrap } from "~/main";

describe("App", () => {
  afterEach(async () => {
    if (App.state !== AppState.Shutdown) {
      await App.shutdown();
    }
  });

  it("should bootstrap app", async () => {
    await App.bootstrap();

    expect(App.state).toBe(AppState.Bootstrapped);
    expect(container.state === ContainerState.Bootstrapped).toBe(true);

    expect(() => App.bootstrap()).rejects.toThrowError("App is already bootstrapped");
  });

  it("should shutdown app", async () => {
    await App.bootstrap();
    await App.shutdown();

    expect(App.state).toBe(AppState.Shutdown);
    expect(container.state === ContainerState.Shutdown).toBe(true);

    expect(() => App.shutdown()).rejects.toThrowError("App is already shut down");
  });

  it("should emit lifecycle events", async () => {
    const bootstrapSpy = vi.fn();
    const initSpy = vi.fn();
    const startSpy = vi.fn();
    const shutdownSpy = vi.fn();

    @usable()
    class MockContainer {
      @bootstrap()
      bootstrap() {
        bootstrapSpy();
      }

      @init()
      init() {
        initSpy();
      }

      @start()
      start() {
        startSpy();
      }

      @shutdown()
      shutdown() {
        shutdownSpy();
      }
    }

    await App.bootstrap();

    expect(bootstrapSpy).toHaveBeenCalled();
    expect(initSpy).toHaveBeenCalled();
    expect(startSpy).toHaveBeenCalled();

    await App.shutdown();

    expect(shutdownSpy).toHaveBeenCalled();
  });
});
