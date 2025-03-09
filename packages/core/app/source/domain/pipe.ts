import { Class, invoke, Container, DecoratorType, createDecorator, parametersMetadata, propertiesMetadata } from "@bunyjs/ioc";

export type NextPipe<T> = () => Promise<T>;

export interface PipeContext<T = any> {
  value: T;
  next: NextPipe<T>;
}

export abstract class $Pipe {
  abstract pipe(pipeContext: PipeContext<any>): any;
}

export const pipe = createDecorator("pipe", (...pipes: Class<$Pipe>[]) => {
  const processPipes = async (container: Container, originalValue: any) => {
    if (!pipes.length) {
      return originalValue;
    }

    const next = async (index: number, value: any): Promise<any> => {
      if (index >= pipes.length) {
        return value;
      }

      const pipe = await container.resolve(pipes[index]);

      return invoke({
        target: pipe,
        method: pipe.pipe,
        args: [{
          value,
          next: () => next(index + 1, value),
        }],
      });
    };

    return next(0, originalValue);
  };

  return {
    apply: [
      DecoratorType.Property,
      DecoratorType.StaticProperty,
      DecoratorType.Parameter,
    ],
    onInit: {
      [DecoratorType.Property]: (context) => {
        propertiesMetadata.for(context.target).add({
          propertyKey: context.propertyKey,
          handler: async (transformHandlerContext) => {
            return processPipes(
              transformHandlerContext.container,
              transformHandlerContext.value,
            );
          },
        });
      },
      [DecoratorType.StaticProperty]: (context) => {
        propertiesMetadata.for(context.target).add({
          propertyKey: context.propertyKey,
          handler: async (transformHandlerContext) => {
            return processPipes(
              transformHandlerContext.container,
              transformHandlerContext.value,
            );
          },
        });
      },
      [DecoratorType.Parameter]: (context) => {
        parametersMetadata.for(context.target, context.propertyKey).add({
          propertyKey: context.propertyKey,
          parameterIndex: context.descriptor,
          handler: async (transformHandlerContext) => {
            return processPipes(
              transformHandlerContext.container,
              transformHandlerContext.value,
            );
          },
        });
      },
    },
  };
});
