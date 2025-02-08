import { Ref, Token, invoke, Container, createToken, DecoratorType, DecoratorLevel, tokenStringify, createDecorator, DecoratorSignature } from "@bunyjs/ioc";

interface EventRegistry {
  token: Token;
  level: DecoratorLevel;
  methodKey: PropertyKey;
  priority: number;
  before: Ref[];
  after: Ref[];
}

const createKey = (event: EventRegistry) => {
  return `${tokenStringify(event.token)}:${event.methodKey.toString()}:${event.level}`;
};

const sortEvents = (events: EventRegistry[]) => {
  events.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const eventMap = new Map<string, EventRegistry>();
  const graph = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();

  for (const event of events) {
    const key = createKey(event);
    eventMap.set(key, event);
    graph.set(key, new Set());
    inDegree.set(key, 0);
  }

  for (const event of events) {
    const key = createKey(event);

    const beforeTokens = event.before.map((ref) => createToken(ref));

    for (const beforeToken of beforeTokens) {
      const targetEvents = Array.from(eventMap.values()).filter((e) => e.token === beforeToken);

      for (const targetEvent of targetEvents) {
        const targetKey = createKey(targetEvent);
        graph.get(key)?.add(targetKey);
        inDegree.set(targetKey, (inDegree.get(targetKey) || 0) + 1);
      }
    }


    const afterTokens = event.after.map((ref) => createToken(ref));

    for (const afterToken of afterTokens) {
      const targetEvents = Array.from(eventMap.values()).filter((e) => e.token === afterToken);

      for (const targetEvent of targetEvents) {
        const targetKey = createKey(targetEvent);
        graph.get(targetKey)?.add(key);
        inDegree.set(key, (inDegree.get(key) || 0) + 1);
      }
    }
  }

  const sorted: EventRegistry[] = [];
  const queue: string[] = [];

  for (const [key, degree] of Array.from(inDegree.entries())) {
    if (degree === 0) {
      queue.push(key);
    }
  }

  while (queue.length > 0) {
    const currentKey = queue.shift() as string;
    const currentEvent = eventMap.get(currentKey) as EventRegistry;
    sorted.push(currentEvent);

    for (const targetKey of graph.get(currentKey) || []) {
      const degree = inDegree.get(targetKey) as number - 1;
      inDegree.set(targetKey, degree);

      if (degree === 0) {
        queue.push(targetKey);
      }
    }
  }

  if (sorted.length !== events.length) {
    throw new Error("Circular dependency detected");
  }

  return sorted;
};

export interface EventConfig {
  priority?: number;
  before?: Ref | Ref[];
  after?: Ref | Ref[];
}

export interface Event {
  (config?: EventConfig): DecoratorSignature;
  emit: (container: Container, ...args: any[]) => Promise<void>;
}

export const createEvent = (name: string) => {
  const registry: EventRegistry[] = [];

  const decorator = createDecorator(name, (config?: EventConfig) => ({
    apply: [
      DecoratorType.Method,
      DecoratorType.StaticMethod,
    ],
    onInit: (context) => {
      const existing = registry.find((e) => {
        return (
          e.token === context.class &&
          e.level === context.level &&
          e.methodKey === context.propertyKey
        );
      });

      if (existing) {
        throw new Error(`Event ${name} is already registered`);
      }

      const before = new Set(config?.before ? (Array.isArray(config.before) ? config.before : [config.before]) : []);
      const after = new Set(config?.after ? (Array.isArray(config.after) ? config.after : [config.after]) : []);
      const priority = config?.priority || 0;

      for (const dep of context.dependencies) {
        after.add(dep);
      }

      registry.push({
        token: context.class,
        level: context.level,
        methodKey: context.propertyKey,
        before: Array.from(before),
        after: Array.from(after),
        priority: priority,
      });
    },
  }));

  const emit = async (container: Container, ...args: any[]) => {
    const sorted = sortEvents(registry);

    for (const event of sorted) {
      if (event.level === DecoratorLevel.Static) {
        await invoke({
          container,
          instance: event.token,
          method: event.token[event.methodKey],
          args,
        });
      } else {
        const instance = await container.resolve(event.token);

        await invoke({
          container,
          instance,
          method: instance[event.methodKey],
          args,
        });
      }
    }
  };

  Reflect.defineProperty(decorator, "emit", {
    value: emit,
  });

  return decorator as Event;
};

export const createEventScope = (scope: string) => {
  return (name: string): Event => {
    return createEvent(`${scope}/${name}`);
  };
};

export const bootstrap = createEvent("bootstrap");
export const init = createEvent("init");
export const start = createEvent("start");
export const shutdown = createEvent("shutdown");
