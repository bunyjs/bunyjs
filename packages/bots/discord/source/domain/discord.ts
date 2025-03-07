import { Class, invoke, container, DecoratorType, resolversMetadata } from "@bunyjs/ioc";

import { Client, Events, Routes, Snowflake, Interaction, ClientOptions } from "discord.js";

import { createDiscordDecorator } from "~/shared/scope";

import { $Button } from "./button";
import { $Interaction, INTRACTION_HANDLER } from "./interaction";
import { $Menu } from "./menu";
import { $Slash } from "./slash";

type ApplicationCommand = $Slash | $Menu;

interface DiscordConfig extends ClientOptions {
  token: string;
}

export class $Discord extends Client {
  static event = createDiscordDecorator("event", (event: Events, once = false) => ({
    apply: DecoratorType.Method,
    onInit: (context) => {
      const metadata = resolversMetadata.from(context.class);

      const resolvers = metadata.get([]);

      resolvers.push({
        handler(resolveHandlerContext) {
          const discord = resolveHandlerContext.instance as $Discord;

          const handler = async (...args: any[]) => {
            const instance = await container.resolve(context.class);
            await invoke({
              container,
              instance,
              method: Reflect.get(context.target, context.propertyKey),
              args,
            });
          };

          const listenerMethod = once ? discord.once : discord.on;
          listenerMethod.call(discord, event, handler);
        },
      });

      metadata.set(resolvers);
    },
  }));

  //

  private interactions = new Set<Class<$Interaction>>();

  static get interaction() {
    return createDiscordDecorator("interaction", () => ({
      apply: DecoratorType.Class,
      instance: $Interaction,
      onInit: (context) => {
        const metadata = resolversMetadata.from(this);

        const resolvers = metadata.get([]);

        resolvers.push({
          handler(resolveHandlerContext) {
            const discord = resolveHandlerContext.instance as $Discord;
            discord.interactions.add(context.class);
          },
        });

        metadata.set(resolvers);
      },
    }));
  }

  private async handleInteraction(interaction: Interaction) {
    const scope = container.createScope();

    const interactions = this.interactions.values();

    if (interaction.isCommand()) {
      const slashCommands = interactions.filter((interaction) => $Slash.isSlash(interaction));

      await Promise.all(slashCommands.map(async (slashCommand) => {
        const instance = await scope.resolve(slashCommand);

        if (!instance.match(interaction)) {
          return;
        }

        await instance[INTRACTION_HANDLER](scope, interaction);

        if (interaction.isAutocomplete()) {
          if (instance.autocomplete) {
            await invoke({
              container: scope,
              instance,
              method: instance.autocomplete,
              args: [interaction],
            });
          }
        }

        if (interaction.isChatInputCommand()) {
          if (instance.interaction) {
            await invoke({
              container: scope,
              instance,
              method: instance.interaction,
              args: [interaction],
            });
          }
        }
      }));
    }

    if (interaction.isButton()) {
      const buttons = interactions.filter((interaction) => $Button.isButton(interaction));

      await Promise.all(buttons.map(async (button) => {
        const instance = await scope.resolve(button);

        const match = instance.match(interaction);

        if (!match) {
          return;
        }

        await scope.register({
          token: $Button.PARAMS,
          useValue: match.params,
        });

        await instance[INTRACTION_HANDLER](scope, interaction);

        if (instance.interaction) {
          await invoke({
            container: scope,
            instance,
            method: instance.interaction,
            args: [interaction],
          });
        }
      }));
    }

    await scope.shutdown();
  }

  constructor(public config: DiscordConfig) {
    super(config);
    this.rest.setToken(config.token);
    this.on("interactionCreate", this.handleInteraction);
  }

  //

  override async login() {
    return super.login(this.config.token);
  }

  //

  private async buildCommands(commands: Class<ApplicationCommand>[]) {
    return Promise.all(commands.map(async (Command) => {
      const instance = await container.resolve(Command);
      return instance.builder.toJSON();
    }));
  }

  async registerApplicationGuildCommands(applicationId: Snowflake, guildId: Snowflake, ...commands: Class<ApplicationCommand>[]) {
    return this.rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
      body: await this.buildCommands(commands),
    });
  }

  async registerApplicationCommands(applicationId: Snowflake, ...commands: Class<ApplicationCommand>[]) {
    return this.rest.put(Routes.applicationCommands(applicationId), {
      body: await this.buildCommands(commands),
    });
  }
}
