import { Class } from "@bunyjs/ioc";

import { SlashCommandBuilder, AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder } from "discord.js";

import { $Commmand } from "./command";
import { $Interaction } from "./interaction";

export class $Slash extends $Commmand {
  declare builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;

  static isSlash(interaction: Class<$Interaction>): interaction is Class<$Slash> {
    return interaction.prototype instanceof $Slash;
  }

  autocomplete?(interaction: AutocompleteInteraction): Promise<void> | void;

  interaction?(interaction: ChatInputCommandInteraction): Promise<void> | void;
}
