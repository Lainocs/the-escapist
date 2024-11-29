import { Command } from "./types/command";
import PingCommand from "./commands/rename";
import { ChatInputCommandInteraction } from "discord.js";

export class InteractionHandler {
  private commands: Command[] = [];

  constructor() {
    this.commands.push(PingCommand());
  }

  getSlashCommands = () => this.commands.map((command: Command) => command.slashCommandConfig.toJSON());

  async handleInteraction(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    console.log("Handling interaction", {
      guild: { id: interaction.guildId },
      user: { name: interaction.user.globalName },
      command: interaction.commandName
    });
    const commandName = interaction.commandName;

    const matchedCommand = this.commands.find(
      (command) => command.slashCommandConfig.name === commandName
    );

    if (!matchedCommand) {
      return Promise.reject("Command not matched");
    }

    matchedCommand
      .execute(interaction)
      .then(() => {
        console.log(
          `Succesfully executed command [/${interaction.commandName}]`,
          {
            guild: { id: interaction.guildId },
            user: { name: interaction.user.globalName },
          }
        );
      })
      .catch((err) =>
        console.error(
          `Error executing command [/${interaction.commandName}]: ${err}`,
          {
            guild: { id: interaction.guildId },
            user: { name: interaction.user.globalName },
          }
        )
      );
  }
}