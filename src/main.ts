import { 
	ChatInputCommandInteraction,
	Client, 
	Events, 
	GatewayIntentBits,
	REST,
	Routes, 
} from 'discord.js'
import { InteractionHandler } from './interaction-hander'
import dotenv from 'dotenv'
import { handleMiam } from './handlers/miamHandler'
import { handleNotionTicket } from './handlers/notionTicketHandler'
import { handlePing } from './handlers/pingHandler'
import { handleQuoi } from './handlers/quoiHandler'

dotenv.config()

const DISCORD_ACCESS_TOKEN = process.env.DISCORD_ACCESS_TOKEN || ''
const DISCORD_APPLICATION_ID = '1299343190687744000'
const DISCORD_TEST_CHANNEL_ID = '1299353563151208470'
const DISCORD_CHANNEL_ID =
	process.env.DISCORD_CHANNEL_ID || DISCORD_TEST_CHANNEL_ID

class EscapistApplication {
	private discordRestClient: REST = new REST().setToken(DISCORD_ACCESS_TOKEN);
	private interactionHandler: InteractionHandler;
	private client: Client;

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
		this.interactionHandler = new InteractionHandler()
	}

	registerSlashCommands() {
		const commands = this.interactionHandler.getSlashCommands();
		this.discordRestClient
			.put(
				Routes.applicationCommands(DISCORD_APPLICATION_ID), 
				{ body: commands }
			)
			.then((data: any) => {
				console.log(`Successfully registered ${data.length} global application (/) commands`);
			})
			.catch((err) => {
				console.error("Error registering application (/) commands", err);
			});
		}

	addClientEventHandlers() {
		this.client.on(Events.Error, (err: Error) => {
			console.error("Client error", err);
		});
		this.client.on(Events.MessageCreate, (message) => {
			handlePing(message)
			handleQuoi(message)
			handleNotionTicket(message)
		})
		this.client.on(Events.InteractionCreate, (interaction) => {
			this.interactionHandler.handleInteraction(
			  interaction as ChatInputCommandInteraction
			);
		  });
	}
	

	startBot() {
		this.client
			.login(DISCORD_ACCESS_TOKEN)
			.then(() => {
				this.addClientEventHandlers();
				this.registerSlashCommands();
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
