import { invoke, DecoratorType, resolversMetadata } from "@bunyjs/ioc";

import { Cacheable, CacheableHooks } from "cacheable";

import { createCacheableDecorator } from "~/shared/scope";

export abstract class $Cacheable extends Cacheable {
  static get hook() {
    return createCacheableDecorator("hook", (hook: CacheableHooks) => ({
      apply: [
        DecoratorType.Method,
      ],
      onInit: (context) => {
        const metadata = resolversMetadata.from(this);

        const resolvers = metadata.get([]);

        resolvers.push({
          handler: async ({ instance, container }) => {
            const cacheable: Cacheable = instance as any;

            cacheable.onHook(hook, async (...args: any[]) => {
              const instance = await container.resolve(context.class);

              await invoke({
                container,
                instance,
                method: instance[context.propertyKey],
                args: args,
              });
            });
          },
        });

        metadata.set(resolvers);
      },
    }));
  }
}
