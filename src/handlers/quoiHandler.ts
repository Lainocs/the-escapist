import { Message } from 'discord.js'

export function handleQuoi(message: Message) {
	const content = message.content.toLowerCase()
	// Regex pour matcher "quoi" avec n'importe quoi avant et des caractères non-alphanumériques après
	const quoiRegex = /.*quoi[^a-zA-Z0-9]*$/
	
	if (quoiRegex.test(content)) {
		message.reply('feur!')
	}
}
