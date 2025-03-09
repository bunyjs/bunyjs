import { DecoratorType, createDecorator } from "./decorator";
import { parametersMetadata, propertiesMetadata } from "./metadata";

export const properties = createDecorator("properties", (key?: string) => ({
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
          return key ? propertyHandlerContext.properties[key] : propertyHandlerContext.properties;
        },
      });
    },
    [DecoratorType.StaticProperty]: (context) => {
      propertiesMetadata.for(context.target).add({
        propertyKey: context.propertyKey,
        handler(propertyHandlerContext) {
          return key ? propertyHandlerContext.properties[key] : propertyHandlerContext.properties;
        },
      });
    },
    [DecoratorType.Parameter]: (context) => {
      parametersMetadata.for(context.target).add({
        propertyKey: context.propertyKey,
        parameterIndex: context.descriptor,
        handler(propertyHandlerContext) {
          return key ? propertyHandlerContext.properties[key] : propertyHandlerContext.properties;
        },
      });
    },
  },
}));
