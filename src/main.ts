import { Client, GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'
import { handleMiam } from './handlers/miamHandler'
import { handleNotionTicket } from './handlers/notionTicketHandler'
import { handlePing } from './handlers/pingHandler'
import { handleQuoi } from './handlers/quoiHandler'
import { handleRompiche } from './handlers/rompicheHandler'

dotenv.config()

const DISCORD_ACCESS_TOKEN = process.env.DISCORD_ACCESS_TOKEN || ''
const DISCORD_TEST_CHANNEL_ID = '1299353563151208470'
const DISCORD_CHANNEL_ID =
	process.env.DISCORD_CHANNEL_ID || DISCORD_TEST_CHANNEL_ID

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

		handleMiam(this.client, DISCORD_CHANNEL_ID)

		this.client.on('messageCreate', (message) => {
			handlePing(message)
			handleQuoi(message)
			handleNotionTicket(message)
			handleRompiche(message)
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
				process.exit(1)
			})
	}
}

const escapistApplication = new EscapistApplication()
escapistApplication.startBot()
