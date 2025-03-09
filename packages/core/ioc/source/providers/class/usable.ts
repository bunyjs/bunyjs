import { container } from "~/domain/container";
import { ResolutionConfig } from "~/domain/provider";
import { Token } from "~/domain/token";

import { DecoratorType, createDecorator } from "./decorator";
import { dependenciesMetadata } from "./metadata";

export interface UsableConfig extends ResolutionConfig {
  dependency?: Token | Token[];
  alias?: Token;
}

export const usable = createDecorator("usable", (config?: UsableConfig) => {
  config = config ?? {} as UsableConfig;

  return {
    apply: [
      DecoratorType.Class,
    ],
    onInit: (context) => {
      const dependencies = Array.isArray(config.dependency) ? config.dependency : [config.dependency];
      dependenciesMetadata.for(context.class).add(...dependencies);
    },
    onBootstrap: async (context) => {
      await container.register({
        ...config,
        token: context.class,
        useClass: context.target,
      });
    },
  };
});
