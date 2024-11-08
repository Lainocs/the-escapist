import { Message } from 'discord.js'

export function handlePing(message: Message) {
	if (message.content.toLowerCase() === 'ping') {
		message.reply('pong')
	}
}
