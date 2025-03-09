import { DecoratorType, createDecorator } from "./decorator";
import { parametersMetadata, propertiesMetadata } from "./metadata";

export const lifetime = createDecorator("lifetime", () => ({
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
          return propertyHandlerContext.lifetime;
        },
      });
    },
    [DecoratorType.StaticProperty]: (context) => {
      propertiesMetadata.for(context.target).add({
        propertyKey: context.propertyKey,
        handler(propertyHandlerContext) {
          return propertyHandlerContext.lifetime;
        },
      });
    },
    [DecoratorType.Parameter]: (context) => {
      parametersMetadata.for(context.target).add({
        propertyKey: context.propertyKey,
        parameterIndex: context.descriptor,
        handler(propertyHandlerContext) {
          return propertyHandlerContext.lifetime;
        },
      });
    },
  },
}));
