import { Container } from "./container";
import { Provider } from "./provider";
import { Token } from "./token";

export interface RegisterEventContext<T = unknown> {
  container: Container;
  token: Token<T>;
  provider: Provider<T>;
}

export interface ResolveEventContext<T = unknown> {
  container: Container;
  token: Token<T>;
  provider: Provider<T>;
  value: T;
}

export interface DisposeEventContext<T = unknown> {
  container: Container;
  token: Token<T>;
  provider: Provider<T>;
  removed: boolean;
}

export interface ObserverEventContext<T = unknown> {
  whenRegister?: (context: RegisterEventContext<T>) => Promise<void> | void;
  whenResolve?: (context: ResolveEventContext<T>) => Promise<void> | void;
  whenDispose?: (context: DisposeEventContext<T>) => Promise<void> | void;
}

export interface Events {
  bootstrap: void;
  shutdown: void;
  register: RegisterEventContext<unknown>;
  resolve: ResolveEventContext<unknown>;
  dispose: DisposeEventContext<unknown>;
}

export type EventCallback<K extends keyof Events> = (context: Events[K]) => Promise<void> | void;

export class Emitter {
  private listeners: Map<string, Function[]>;
  private onceListeners: Map<string, Function[]>;

  constructor() {
    this.listeners = new Map();
    this.onceListeners = new Map();
  }

  on = <K extends keyof Events>(event: K, callback: EventCallback<K>) => {
    const listeners = this.listeners.get(event);

    if (listeners) {
      listeners.push(callback);
    } else {
      this.listeners.set(event, [callback]);
    }

    return () => {
      this.off(event, callback);
    };
  };

  once = <K extends keyof Events>(event: K, callback: EventCallback<K>) => {
    const listeners = this.onceListeners.get(event);

    if (listeners) {
      listeners.push(callback);
    } else {
      this.onceListeners.set(event, [callback]);
    }

    return () => {
      this.off(event, callback);
    };
  };

  off = <K extends keyof Events>(event: K, callback: EventCallback<K>) => {
    const listeners = this.listeners.get(event);
    const onceListeners = this.onceListeners.get(event);

    if (listeners) {
      const index = listeners.indexOf(callback);

      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }

    if (onceListeners) {
      const index = onceListeners.indexOf(callback);

      if (index !== -1) {
        onceListeners.splice(index, 1);
      }
    }
  };

  emit = async <K extends keyof Events>(event: K, context: Events[K]) => {
    const listeners = this.listeners.get(event);
    const onceListeners = this.onceListeners.get(event);

    if (listeners) {
      for (const listener of listeners) {
        await listener(context);
      }
    }

    if (onceListeners) {
      for (const listener of onceListeners) {
        await listener(context);
      }

      this.onceListeners.delete(event);
    }
  };

  observe = <T>(token: Token<T>, context: ObserverEventContext<T>) => {
    const offs = [];

    if (context.whenRegister) {
      offs.push(this.on("register", async (event) => {
        if (event.token === token) {
          await context.whenRegister(event as RegisterEventContext<T>);
        }
      }));
    }

    if (context.whenResolve) {
      offs.push(this.on("resolve", async (event) => {
        if (event.token === token) {
          await context.whenResolve(event as ResolveEventContext<T>);
        }
      }));
    }

    if (context.whenDispose) {
      offs.push(this.on("dispose", async (event) => {
        if (event.token === token) {
          await context.whenDispose(event as DisposeEventContext<T>);
        }
      }));
    }

    return () => {
      for (const off of offs) {
        off();
      }
    };
  };

  observeOnce = <T>(token: Token<T>, context: ObserverEventContext<T>) => {
    const offs = [];

    if (context.whenRegister) {
      offs.push(this.once("register", async (event) => {
        if (event.token === token) {
          await context.whenRegister(event as RegisterEventContext<T>);
        }
      }));
    }

    if (context.whenResolve) {
      offs.push(this.once("resolve", async (event) => {
        if (event.token === token) {
          await context.whenResolve(event as ResolveEventContext<T>);
        }
      }));
    }

    if (context.whenDispose) {
      offs.push(this.once("dispose", async (event) => {
        if (event.token === token) {
          await context.whenDispose(event as DisposeEventContext<T>);
        }
      }));
    }

    return () => {
      for (const off of offs) {
        off();
      }
    };
  };
}
