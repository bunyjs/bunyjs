import { ContextMenuCommandBuilder, ContextMenuCommandInteraction } from "discord.js";

import { $Commmand } from "./command";

export abstract class $Menu extends $Commmand {
  declare builder: ContextMenuCommandBuilder;

  static isMenu(interaction: any): interaction is typeof $Menu {
    return interaction.prototype instanceof $Menu;
  }

  interaction?(interaction: ContextMenuCommandInteraction): Promise<void> | void;
}
