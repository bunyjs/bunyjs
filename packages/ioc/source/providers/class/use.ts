import { ProviderResolveConfig } from "~/domain/provider";
import { Token } from "~/domain/token";

import { DecoratorType, createDecorator } from "./decorator";
import { metadata } from "./metadata";

interface UseDecoratorConfig extends ProviderResolveConfig<any> {
  token?: Token;
}

export const use = createDecorator("use", (token?: Token | UseDecoratorConfig) => {
  let config: UseDecoratorConfig = {};

  if (typeof token === "object") {
    config = token;
  } else {
    config.token = token;
  }

  return {
    apply: [
      DecoratorType.Property,
      DecoratorType.StaticProperty,
      DecoratorType.Parameter,
    ],
    onInit: {
      [DecoratorType.Property]: (context) => {
        let token = config.token;

        if (!token) {
          const propertyType = metadata.getType(context.target, context.propertyKey);

          if (!propertyType) {
            throw new Error(`Cannot resolve token for instance property "${context.propertyKey.toString()}" in decorator "${context.decoratorName}" at "${context.decoratorPath}"`);
          }

          token = propertyType;
        }

        context.addDependency(token);

        context.addProperty({
          propertyKey: context.propertyKey,
          handler: ({ container, target, tags }) => {
            return container.resolve(token, {
              ...config,
              optional: true,
              target,
              tags,
            });
          },
        });
      },
      [DecoratorType.StaticProperty]: (context) => {
        let token = config.token;

        if (!token) {
          const propertyType = metadata.getType(context.target, context.propertyKey);

          if (!propertyType) {
            throw new Error(`Cannot resolve token for static property "${context.propertyKey.toString()}" in decorator "${context.decoratorName}" at "${context.decoratorPath}"`);
          }

          token = propertyType;
        }

        context.addDependency(token);

        context.addProperty({
          propertyKey: context.propertyKey,
          handler: ({ container, target, tags }) => {
            return container.resolve(token, {
              ...config,
              optional: true,
              target,
              tags,
            });
          },
        });
      },
      [DecoratorType.Parameter]: (context) => {
        let token = config.token;

        if (!token) {
          const parameterTypes = metadata.getParamTypes(context.target, context.propertyKey);

          const parameterType = parameterTypes[context.descriptor];

          if (!parameterType) {
            throw new Error(`Cannot resolve token for parameter "${context.propertyKey.toString()}" at index "${context.descriptor}" in decorator "${context.decoratorName}" at "${context.decoratorPath}"`);
          }

          token = parameterType;
        }

        context.addDependency(token);

        context.addParameter({
          methodKey: context.propertyKey,
          index: context.descriptor,
          handler: ({ container, target, tags }) => {
            return container.resolve(token, {
              ...config,
              optional: true,
              target,
              tags,
            });
          },
        });
      },
    },
  };
});