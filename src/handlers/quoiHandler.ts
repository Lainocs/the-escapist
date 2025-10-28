import { Message } from 'discord.js'

export function handleQuoi(message: Message) {
	const content = message.content.toLowerCase()
	// Regex pour matcher "quoi" avec n'importe quoi avant et des caractères non-alphanumériques après
	const quoiRegex = /.*quoi[^a-zA-Z0-9]*$/
	const whatRegex = /.*what[^a-zA-Z0-9]*$/
	
	if (quoiRegex.test(content)) {
		message.reply('feur!')
	} else if (whatRegex.test(content)) {
		const whatReplies = [
			'ever.',           // Whatever (classic sassy reply)
			'the heck.',       // What the heck! (chaotic energy)
			'sup?',            // What's up? (friendly twist)
			'a day!',          // What a day! (fake-dramatic punch)
			'erloo!',          // Waterloo (for nerdy historical humor)
		]
		const randomReply = whatReplies[Math.floor(Math.random() * whatReplies.length)]
		message.reply(randomReply)
	}
}
