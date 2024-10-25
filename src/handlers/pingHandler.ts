import { Message } from 'discord.js'

export function handlePing(message: Message) {
	if (message.content === 'ping') {
		message.reply('pong')
	}
}
