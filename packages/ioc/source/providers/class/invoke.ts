import { container, Container } from "~/domain/container";
import { ResolutionConfig } from "~/domain/provider";

import { metadata, parametersMetadata } from "./metadata";

type Method = (...args: any[]) => any;

export interface InvokeConfig<T extends Method> extends ResolutionConfig {
  target: any;
  method: T;
  scope?: Container;
  args?: any[];
}

export const invoke = async <T extends Method>(config: InvokeConfig<T>): Promise<ReturnType<T>> => {
  let { target, method, args, scope } = config;

  scope ??= container;
  args ??= [];

  const parameters = parametersMetadata.get(target, method.name) || [];

  for (const parameter of parameters) {
    args[parameter.index] = await parameter.handler({
      container: scope,
    });
  }

  const paramTypes = metadata.getParamTypes(target, method.name) || [];

  for (const [i, paramType] of paramTypes.entries()) {
    if (parameters.some((parameter) => parameter.index === i)) {
      continue;
    }

    if (paramType) {
      args[i] = await scope.resolve(paramType, {
        optional: true,
      });
    }
  }

  return Reflect.apply(method, target, args);
};
