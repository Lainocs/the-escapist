import { Client, PollLayoutType, TextChannel } from 'discord.js'
import cron from 'node-cron'
import addresses from '../data/addresses.json'

interface PollAnswerData {
	text: string
}

const displayAnswers = (): PollAnswerData[] => {
	return addresses.map(({ emoji, name }) => ({
		text: `${emoji} - ${name}`,
	}))
}

export function handleMiam(client: Client, channelId: string) {
	cron.schedule(
		'0 12 * * 1-5',
		() => {
			const channel = client.channels.cache.get(channelId) as TextChannel
			if (channel) {
				channel.send({
					poll: {
						question: { text: 'Time to choose !, what do you want to eat ?' },
						answers: displayAnswers(),
						allowMultiselect: true,
						duration: 1,
						layoutType: PollLayoutType.Default,
					},
				})
			}
		},
		{
			timezone: 'Europe/Paris',
		}
	)
}
