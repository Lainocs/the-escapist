import { ChatInputCommandInteraction } from 'discord.js'
import RenameCommand from './commands/rename'
import TicketCommand from './commands/ticket'
import { Command } from './types/command'

export class InteractionHandler {
	private commands: Command[] = []

	constructor() {
		this.commands.push(RenameCommand(), TicketCommand())
	}

	getSlashCommands = () =>
		this.commands.map((command: Command) => command.slashCommandConfig.toJSON())

	async handleInteraction(
		interaction: ChatInputCommandInteraction
	): Promise<void> {
		const commandName = interaction.commandName

		const matchedCommand = this.commands.find(
			(command) => command.slashCommandConfig.name === commandName
		)

		if (!matchedCommand) {
			return Promise.reject('Command not matched')
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
				)
			})
			.catch((err) =>
				console.error(
					`Error executing command [/${interaction.commandName}]: ${err}`,
					{
						guild: { id: interaction.guildId },
						user: { name: interaction.user.globalName },
					}
				)
			)
	}
}
