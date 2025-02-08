import { invoke, DecoratorType, resolversMetadata } from "@bunyjs/ioc";

import Redis from "ioredis";

import { createRedisDecorator } from "~/shared/scope";

export abstract class $Redis extends Redis {
  static get subscribe() {
    return createRedisDecorator("subscribe", (...channels: (string | Buffer)[]) => ({
      apply: [
        DecoratorType.Method,
      ],
      onInit(context) {
        const metadata = resolversMetadata.from(this);

        const resolvers = metadata.get([]);

        resolvers.push({
          handler({ container, instance }) {
            const redis = instance as Redis;
            redis.subscribe(...channels, async (...args) => {
              await invoke({
                container,
                instance,
                method: instance[context.propertyKey],
                args,
              });
            });
          },
        });
      },
    }));
  }
}
