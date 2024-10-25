import { Client, GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'
import { handlePing } from './handlers/pingHandler'
dotenv.config()

const DISCORD_ACCESS_TOKEN = process.env.DISCORD_ACCESS_TOKEN || ''

class EscapistApplication {
	private client: Client

	constructor() {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
			],
			shards: 'auto',
			failIfNotExists: false,
		})

		this.client.on('messageCreate', (message) => {
			handlePing(message)
		})
	}

	startBot() {
		this.client
			.login(DISCORD_ACCESS_TOKEN)
			.then(() => {
				console.log('Bot started')
			})
			.catch((err) => {
				console.error('Error starting bot', err)
			})
	}
}

const escapistApplication = new EscapistApplication()
escapistApplication.startBot()
