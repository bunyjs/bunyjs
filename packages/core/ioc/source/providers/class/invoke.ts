import { container, Container } from "~/domain/container";
import { ResolutionConfig } from "~/domain/provider";

import { parametersMetadata, interceptorsMetadata } from "./metadata";

type Method = (...args: any[]) => any;

export interface InvokeConfig<T extends Method> extends ResolutionConfig {
  target: unknown;
  method: T;
  args?: Partial<Parameters<T>>;
  scope?: Container;
}

export const invoke = async <T extends Method>(config: InvokeConfig<T>): Promise<ReturnType<T>> => {
  const { target, method, args = [], scope = container, lifetime, identifier, properties } = config;

  const parameters = parametersMetadata.get(target, method.name);

  for (const parameter of parameters) {
    args[parameter.parameterIndex] = await parameter.handler({
      value: args[parameter.parameterIndex],
      container: scope,
      lifetime,
      identifier,
      properties,
    });
  }

  const interceptors = interceptorsMetadata.get(target, method.name);

  if (interceptors.length <= 0) {
    return Reflect.apply(method, target, args);
  }

  const interceptorsChain = interceptors.map((interceptor) => interceptor.handler);

  const intercept = async (index: number) => {
    if (index >= interceptorsChain.length) {
      return Reflect.apply(method, target, args);
    }

    const interceptor = interceptorsChain[index];

    return interceptor({
      next: () => intercept(index + 1),
      container: scope,
      lifetime,
      identifier,
      properties,
    });
  };

  return intercept(0);
};
