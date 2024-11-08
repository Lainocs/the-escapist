import { Client, GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'
import { handleMiam } from './handlers/miamHandler'
import { handlePing } from './handlers/pingHandler'
dotenv.config()

const DISCORD_ACCESS_TOKEN = process.env.DISCORD_ACCESS_TOKEN || ''

class EscapistApplication {
	private client: Client

	constructor() {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildMessagePolls,
			],
			shards: 'auto',
			failIfNotExists: false,
		})

		handleMiam(this.client, process.env.DISCORD_CHANNEL_ID)

		this.client.on('messageCreate', (message) => {
			handlePing(message)
		})
	}

	startBot() {
		this.client
			.login(DISCORD_ACCESS_TOKEN)
			.then(() => {
				console.log('\x1b[32mBot started\x1b[0m');
			})
			.catch((err) => {
				console.error('Error starting bot', err)
			})
	}
}

const escapistApplication = new EscapistApplication()
escapistApplication.startBot()
