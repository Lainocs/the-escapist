import { Message } from 'discord.js'

export function handleQuoi(message: Message) {
	if (message.content.toLowerCase() === 'quoi') {
		message.reply('feur!')
	}
}
