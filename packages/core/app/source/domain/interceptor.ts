import { Class, invoke, DecoratorType, createDecorator, interceptorsMetadata } from "@bunyjs/ioc";

export type NextInterceptor<T> = () => Promise<T>;

export interface InterceptorContext<T = any> {
  next: NextInterceptor<T>;
}

export abstract class $Interceptor {
  abstract intercept(interceptorContext: InterceptorContext): any;
}

export const interceptor = createDecorator("interceptor", (...interceptors: Class<$Interceptor>[]) => {
  return {
    apply: [
      DecoratorType.Method,
      DecoratorType.StaticMethod,
    ],
    onInit: (context) => {
      interceptorsMetadata.for(context.target, context.propertyKey).add({
        handler(interceptorContext) {
          const next = async (index: number) => {
            if (index >= interceptors.length) {
              return interceptorContext.next();
            }

            const interceptor = await interceptorContext.container.resolve(interceptors[index]);

            return invoke({
              target: interceptor,
              method: interceptor.intercept,
              args: [{
                next: () => next(index + 1),
              }],
            });
          };

          return next(0);
        },
      });
    },
  };
});
