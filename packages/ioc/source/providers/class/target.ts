import { DecoratorType, createDecorator } from "./decorator";

export const target = createDecorator("target", () => ({
  apply: [
    DecoratorType.Property,
    DecoratorType.StaticProperty,
    DecoratorType.Parameter,
  ],
  onRegister: {
    [DecoratorType.Property]: (context) => {
      context.addProperty({
        propertyKey: context.propertyKey,
        handler: () => {
          return context.provider.config.target;
        },
      });
    },
    [DecoratorType.StaticProperty]: (context) => {
      context.addProperty({
        propertyKey: context.propertyKey,
        handler: () => {
          return context.provider.config.target;
        },
      });
    },
    [DecoratorType.Parameter]: (context) => {
      context.addParameter({
        index: context.descriptor,
        methodKey: context.propertyKey,
        handler: () => {
          return context.provider.config.target;
        },
      });
    },
  },
}));
