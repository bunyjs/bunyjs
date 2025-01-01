import { it, vi, expect, describe, beforeEach } from "vitest";

import { Emitter, Provider, Container, DisposeEventContext, ResolveEventContext, RegisterEventContext } from "~/main";

class MockService {
}

class MockProvider extends Provider<string> {
  resolved = false;
  disposed = false;
  config: any;

  register() {
    return Promise.resolve();
  }

  resolve() {
    return Promise.resolve("test-value");
  }

  dispose() {
    return Promise.resolve();
  }
}

describe("Emitter", () => {
  let container: Container;
  let provider: MockProvider;
  let emitter: Emitter;

  beforeEach(() => {
    container = new Container();
    provider = new MockProvider();
    emitter = new Emitter();
  });

  it("should register and emit an event", async () => {
    const callback = vi.fn();

    emitter.on("bootstrap", callback);

    await emitter.emit("bootstrap", undefined);

    expect(callback).toHaveBeenCalledOnce();
  });

  it("should register a one-time event listener", async () => {
    const callback = vi.fn();

    emitter.once("shutdown", callback);

    await emitter.emit("shutdown", undefined);
    await emitter.emit("shutdown", undefined);

    expect(callback).toHaveBeenCalledOnce();
  });

  it("should remove an event listener", async () => {
    const callback = vi.fn();

    const off = emitter.on("register", callback);

    off();

    await emitter.emit("register", {
      container,
      provider,
      token: MockService,
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("should emit context correctly", async () => {
    const callback = vi.fn();

    emitter.on("resolve", callback);

    const context: ResolveEventContext<MockService> = {
      container,
      provider,
      token: MockService,
      value: "test-value",
    };

    await emitter.emit("resolve", context);

    expect(callback).toHaveBeenCalledWith(context);
  });

  it("should observe specific events", async () => {
    const whenRegister = vi.fn();
    const whenResolve = vi.fn();
    const whenDispose = vi.fn();

    emitter.observe(MockService, {
      whenRegister,
      whenResolve,
      whenDispose,
    });

    const registerContext: RegisterEventContext<MockService> = {
      container,
      provider,
      token: MockService,
    };
    const resolveContext: ResolveEventContext<MockService> = {
      container,
      provider,
      token: MockService,
      value: "test-value",
    };
    const disposeContext: DisposeEventContext<MockService> = {
      container,
      provider,
      token: MockService,
      removed: true,
    };

    await emitter.emit("register", registerContext);
    await emitter.emit("resolve", resolveContext);
    await emitter.emit("dispose", disposeContext);

    expect(whenRegister).toHaveBeenCalledWith(registerContext);
    expect(whenResolve).toHaveBeenCalledWith(resolveContext);
    expect(whenDispose).toHaveBeenCalledWith(disposeContext);
  });

  it("should observe events only once", async () => {
    const whenRegister = vi.fn();
    const whenResolve = vi.fn();
    const whenDispose = vi.fn();

    emitter.observeOnce(MockService, {
      whenRegister,
      whenResolve,
      whenDispose,
    });


    const registerContext: RegisterEventContext<MockService> = {
      container,
      provider,
      token: MockService,
    };
    const resolveContext: ResolveEventContext<MockService> = {
      container,
      provider,
      token: MockService,
      value: "test-value",
    };
    const disposeContext: DisposeEventContext<MockService> = {
      container,
      provider,
      token: MockService,
      removed: true,
    };

    await emitter.emit("register", registerContext);
    await emitter.emit("register", registerContext);

    await emitter.emit("resolve", resolveContext);
    await emitter.emit("resolve", resolveContext);
    await emitter.emit("dispose", disposeContext);

    expect(whenRegister).toHaveBeenCalledOnce();
    expect(whenResolve).toHaveBeenCalledOnce();
    expect(whenDispose).toHaveBeenCalledOnce();
  });

  it("should handle multiple listeners for the same event", async () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    emitter.on("bootstrap", callback1);
    emitter.on("bootstrap", callback2);

    await emitter.emit("bootstrap", undefined);

    expect(callback1).toHaveBeenCalledOnce();
    expect(callback2).toHaveBeenCalledOnce();
  });

  it("should handle multiple listeners for the same once event", async () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    emitter.once("shutdown", callback1);
    emitter.once("shutdown", callback2);

    await emitter.emit("shutdown", undefined);

    expect(callback1).toHaveBeenCalledOnce();
    expect(callback2).toHaveBeenCalledOnce();
  });

  it("should clear once listeners after emission", async () => {
    const callback = vi.fn();

    emitter.once("dispose", callback);

    await emitter.emit("dispose", undefined);
    await emitter.emit("dispose", undefined);

    expect(callback).toHaveBeenCalledOnce();
  });

  it("should remove observer", async () => {
    const whenRegister = vi.fn();

    const observerOff = emitter.observe(MockService, {
      whenRegister,
    });
    const observerOnceOff = emitter.observeOnce(MockService, {
      whenRegister,
    });

    observerOff();
    observerOnceOff();

    const registerContext: RegisterEventContext<MockService> = {
      container,
      provider,
      token: MockService,
    };

    await emitter.emit("register", registerContext);

    expect(whenRegister).not.toHaveBeenCalled();
  });
});
