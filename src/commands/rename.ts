import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    MessageFlags,
} from 'discord.js';
import { Command } from '../types/command';

export default (): Command => {
    return {
        slashCommandConfig: new SlashCommandBuilder()
            .setName('rename')
            .addStringOption((option) => option.setName('status').setDescription('Chose status of current deals (Alert 🚨, Ok 🆗 or with custom icon 👾)').setRequired(true)
			.addChoices(
				{ name: 'Ok', value: '🆗' },
				{ name: 'Alert', value: '🚨' },
				{ name: 'Custom', value: 'custom' },
			))
            .addStringOption((option) => option.setName('icon').setDescription('Chose custom icon').setRequired(false))
            .setDescription('Change status of current deals'),
        execute: async (interaction: ChatInputCommandInteraction) => {
            try {
                const option = interaction.options.getString('status');
                const icon = interaction.options.getString('icon');
                const name = interaction.channel.name.includes(' • ') ? interaction.channel.name.split(' • ')[1].trim() : interaction.channel.name;
                const editedName = icon ? `${icon} • ${name}` : `${option} • ${name}`;
        
                // Await the channel name change
                await interaction.reply({ content: `Try to update status...`, flags: MessageFlags.Ephemeral });
                const newChannel = await interaction.channel.setName(editedName);
                console.log(`Channel's new name is ${newChannel.name}`);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: `Failed to update status`, flags: MessageFlags.Ephemeral });
            }
        }
    }
}
