import { DecoratorType, createDecorator } from "./decorator";
import { parametersMetadata, propertiesMetadata } from "./metadata";

export const identifier = createDecorator("identifier", () => ({
  apply: [
    DecoratorType.Property,
    DecoratorType.StaticProperty,
    DecoratorType.Parameter,
  ],
  onInit: {
    [DecoratorType.Property]: (context) => {
      propertiesMetadata.for(context.target).add({
        propertyKey: context.propertyKey,
        handler(propertyHandlerContext) {
          return propertyHandlerContext.identifier;
        },
      });
    },
    [DecoratorType.StaticProperty]: (context) => {
      propertiesMetadata.for(context.target).add({
        propertyKey: context.propertyKey,
        handler(propertyHandlerContext) {
          return propertyHandlerContext.identifier;
        },
      });
    },
    [DecoratorType.Parameter]: (context) => {
      parametersMetadata.for(context.target, context.propertyKey).add({
        propertyKey: context.propertyKey,
        parameterIndex: context.descriptor,
        handler(parameterHandlerContext) {
          return parameterHandlerContext.identifier;
        },
      });
    },
  },
}));
