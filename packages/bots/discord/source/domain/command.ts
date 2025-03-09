import { CommandInteraction, SharedSlashCommand, ContextMenuCommandBuilder } from "discord.js";

import { $Interaction } from "./interaction";

export class $Commmand extends $Interaction {
  builder: SharedSlashCommand | ContextMenuCommandBuilder;
  
  match = (interaction: CommandInteraction) => {
    const { commandName } = interaction;
    return commandName === this.builder.name;
  };
}
