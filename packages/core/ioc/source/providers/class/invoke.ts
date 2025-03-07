import { Container } from "~/domain/container";
import { ResolutionConfig } from "~/domain/provider";

import { metadata, parametersMetadata } from "./metadata";

type Method = (...args: any[]) => any;

export interface InvokeConfig<T extends Method> extends ResolutionConfig {
  container: Container;
  instance: any;
  method: T;
  args?: any[];
}

export const invoke = async <T extends Method>(config: InvokeConfig<T>): Promise<ReturnType<T>> => {
  let { container, instance, method, args, scope, target, tags } = config;

  args ??= [];

  const parameters = parametersMetadata.get(instance, method.name) || [];

  for (const parameter of parameters) {
    args[parameter.index] = await parameter.handler({
      container,
      scope,
      target,
      tags,
    });
  }

  const paramTypes = metadata.getParamTypes(instance, method.name) || [];

  for (const [i, paramType] of paramTypes.entries()) {
    if (parameters.some((parameter) => parameter.index === i) || args[i] !== undefined) {
      continue;
    }

    if (paramType) {
      args[i] = await container.resolve(paramType, {
        optional: true,
        scope,
        target,
        tags,
      });
    }
  }

  return Reflect.apply(method, instance, args);
};
