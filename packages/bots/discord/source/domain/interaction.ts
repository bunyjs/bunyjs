import { Class, invoke, Container, DecoratorType, resolversMetadata } from "@bunyjs/ioc";

import { Interaction } from "discord.js";

import { createDiscordDecorator } from "~/shared/scope";

interface Handler {
  token: Class;
  method: PropertyKey;
}

export const INTRACTION_HANDLER = Symbol("INTRACTION_HANDLER");

export class $Interaction {
  private handlers: Handler[] = [];

  static get handler() {
    return createDiscordDecorator("intraction:handle", () => ({
      apply: DecoratorType.Method,
      onInit: (context) => {
        const metadata = resolversMetadata.from(this);

        const resolvers = metadata.get([]);

        resolvers.push({
          handler(resolveHandlerContext) {
            const instance = resolveHandlerContext.instance as $Interaction;
            instance.handlers.push({
              token: context.class,
              method: context.propertyKey,
            });
          },
        });

        metadata.set(resolvers);
      },
    }));
  }

  protected [INTRACTION_HANDLER] = async (scope: Container, intraction: Interaction) => {
    for (const handler of this.handlers) {
      const instance = await scope.resolve(handler.token);
      await invoke({
        container: scope,
        instance,
        method: instance[handler.method],
        args: [intraction],
      });
    }
  };
}
