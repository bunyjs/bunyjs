import { DecoratorType, createDecorator } from "./decorator";

export const scope = createDecorator("scope", () => ({
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
          return propertyHandlerContext.target;
        },
      });
    },
    [DecoratorType.StaticProperty]: (context) => {
      context.addProperty({
        propertyKey: context.propertyKey,
        handler(propertyHandlerContext) {
          return propertyHandlerContext.target;
        },
      });
    },
    [DecoratorType.Parameter]: (context) => {
      context.addParameter({
        index: context.descriptor,
        methodKey: context.propertyKey,
        handler(propertyHandlerContext) {
          return propertyHandlerContext.target;
        },
      });
    },
  },
}));
