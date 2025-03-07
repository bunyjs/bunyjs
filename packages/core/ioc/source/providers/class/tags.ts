import { DecoratorType, createDecorator } from "./decorator";

export const tags = createDecorator("tags", (key?: string) => ({
  apply: [
    DecoratorType.Property,
    DecoratorType.StaticProperty,
    DecoratorType.Parameter,
  ],
  onRegister: {
    [DecoratorType.Property]: (context) => {
      context.addProperty({
        propertyKey: context.propertyKey,
        handler(propertyHandlerContext) {
          const tags = propertyHandlerContext.tags;

          if (key) {
            return Reflect.get(tags, key, []);
          }

          return tags;
        },
      });
    },
    [DecoratorType.StaticProperty]: (context) => {
      context.addProperty({
        propertyKey: context.propertyKey,
        handler(propertyHandlerContext) {
          const tags = propertyHandlerContext.tags;

          if (key) {
            return Reflect.get(tags, key, []);
          }

          return tags;
        },
      });
    },
    [DecoratorType.Parameter]: (context) => {
      context.addParameter({
        index: context.descriptor,
        methodKey: context.propertyKey,
        handler: (parameterHandlerContext) => {
          const tags = parameterHandlerContext.tags;

          if (key) {
            return Reflect.get(tags, key, []);
          }

          return tags;
        },
      });
    },
  },
}));
