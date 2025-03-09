import { Class, DecoratorType } from "@bunyjs/ioc";

import { ButtonBuilder, ButtonInteraction } from "discord.js";
import { match, compile, ParamData } from "path-to-regexp";

import { createDiscordDecorator } from "~/shared/scope";

import { $Interaction } from "./interaction";

export class $Button<T extends ParamData = ParamData> extends $Interaction {
  builder: ButtonBuilder;

  static PARAMS = Symbol("PARAMS");

  static isButton(interaction: Class<$Interaction>): interaction is Class<$Button> {
    return interaction.prototype instanceof $Button;
  }

  match = (interaction: ButtonInteraction) => {
    const id = (this.builder.data as any).custom_id;

    const matcher = match<T>(id, {
      decode: false,
    });

    return matcher(interaction.customId);
  };

  compile = (data?: T) => {
    const id = (this.builder.data as any).custom_id;

    const compiler = compile<T>(id, {
      encode: false,
    });

    return compiler(data);
  };

  interaction?(interaction: ButtonInteraction, ...args: any[]): Promise<void> | void;
}

export const buttonParams = createDiscordDecorator("button:params", () => ({
  apply: DecoratorType.Parameter,
  onInit: (context) => {
    context.addParameter({
      methodKey: context.propertyKey,
      index: context.descriptor,
      handler: (parameterHandlerContext) => {
        return parameterHandlerContext.container.resolve($Button.PARAMS);
      },
    });
  },
}));

export const buttonParam = createDiscordDecorator("button:param", (param: string) => ({
  apply: DecoratorType.Parameter,
  onInit: (context) => {
    context.addParameter({
      methodKey: context.propertyKey,
      index: context.descriptor,
      handler: async (parameterHandlerContext) => {
        const params = await parameterHandlerContext.container.resolve($Button.PARAMS);
        return params[param];
      },
    });
  },
}));
