import dotenv from 'dotenv'
import { Message } from "discord.js";

dotenv.config()

const rompicheURL = process.env.ROMPICHE_PICTURE || ''
let rompiche = false

export function handleRompiche(message: Message) {
	if (message.author.bot) return;
	if (message.content.toLowerCase().includes('rompiche') && !rompiche) {
		message.reply(rompicheURL)
		rompiche = true
		return;
	}
	if (message.content.toLowerCase().includes('rompiche') && rompiche) {
		message.reply('_Zzz_')
		return;
	}
	if (message.content.toLowerCase().includes('pokeflute') && rompiche) {
		message.reply('_rompiche wakes up_')
		rompiche = false
		return;
	}
}
