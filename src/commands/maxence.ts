import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { Command } from '../types/command'

export default (): Command => {
	return {
		slashCommandConfig: new SlashCommandBuilder()
			.setName('maxence')
			.setDescription('Create a merge request message for Maxence')
			.addStringOption((option) =>
				option
					.setName('title')
					.setDescription('The title of the merge request')
					.setRequired(true)
			)
			.addStringOption((option) =>
				option
					.setName('link')
					.setDescription('The link to the merge request')
					.setRequired(true)
			)
			.addStringOption((option) =>
				option
					.setName('description')
					.setDescription('Description of the changes')
					.setRequired(true)
			),
		execute: async (interaction: ChatInputCommandInteraction) => {
			const title = interaction.options.getString('title', true)
			const link = interaction.options.getString('link', true)
			const description = interaction.options.getString('description', true)
			const author = interaction.user.username

			// Format the message with a mention to Maxence
			const message = `<@960824093349916692> New merge request to review!\n\n**Title**: ${title}\n**Link**: ${link}\n**From**: ${author}\n\n**Description**:\n${description}`

			await interaction.reply(message)
		},
	}
}
