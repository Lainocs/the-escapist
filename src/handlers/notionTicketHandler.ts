import { Client } from '@notionhq/client'
import { Message, NewsChannel, TextChannel } from 'discord.js'
import dotenv from 'dotenv'

dotenv.config()

console.log(process.env.NOTION_API_KEY)

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID
const NOTION_EPIC_ID = process.env.NOTION_EPIC_ID

export async function handleNotionTicket(message: Message) {
	if (message.content.toLowerCase().startsWith('/ticket')) {
		const messageChannel = message.channel

		let ticketTitle = message.content.split(' ').slice(1).join(' ')
		if (
			messageChannel instanceof TextChannel ||
			messageChannel instanceof NewsChannel
		) {
			if (!ticketTitle) {
				const channelName = messageChannel.name

				ticketTitle = `${channelName}`
			}
		} else {
			console.log('The channel does not have a `name` property.')
		}

		message.reply('Creating ticket...')

		const response = await notion.pages.create({
			parent: {
				type: 'database_id',
				database_id: NOTION_DATABASE_ID,
			},
			properties: {
				Name: {
					title: [
						{
							text: {
								content: ticketTitle,
							},
						},
					],
				},
				'👫 Team': {
					multi_select: [{ name: 'Tech - App' }],
				},
				'🎯 Priority': {
					select: { name: '#P1' },
				},
				'🏔️ Epic': {
					relation: [
						{
							id: NOTION_EPIC_ID || '',
						},
					],
				},
			},
		})

		const messages = (await messageChannel.messages.fetch({ limit: 20 }))
			.filter(
				(msg) =>
					!msg.content.toLowerCase().startsWith('/ticket') &&
					msg.content !== 'Creating ticket...'
			)
			.reverse()

		const urls = messages
			.map((msg) => {
				const urlRegex = /(https?:\/\/[^\s]+)/g
				const urls = msg.content.match(urlRegex)
				return urls ? urls : []
			})
			.flat()

		const blockId = response.id

		await notion.blocks.children.append({
			block_id: blockId,
			children: [
				{
					quote: {
						rich_text: [
							{
								text: {
									content: 'Ticket created by The Escapist bot. \n',
								},
							},
							{
								text: {
									content: messageChannel.url,
									link: {
										url: messageChannel.url,
									},
								},
							},
						],
					},
				},
				{
					heading_2: {
						rich_text: [
							{
								text: {
									content: 'Link',
								},
							},
						],
					},
				},
				{
					paragraph: {
						rich_text: urls.map((url) => ({
							text: {
								content: url,
								link: {
									url: url,
								},
							},
						})),
					},
				},
				{
					image: {
						type: 'external',
						external: {
							url: messages
								.map((msg) => {
									if (msg.attachments.size > 0) {
										return msg.attachments.first()?.url
									}
									return null
								})
								.filter((url) => url !== null)
								.join(', '),
						},
					},
				},
				{
					heading_2: {
						rich_text: [
							{
								text: {
									content: 'Ticket details',
								},
							},
						],
					},
				},
				{
					paragraph: {
						rich_text: [
							{
								text: {
									content: messages.map((msg) => msg.content).join('\n'),
								},
							},
						],
					},
				},
			],
		})

		const ticketUrl = `https://www.notion.so/${response.id.replace(/-/g, '')}`
		message.reply(
			`Ticket "${ticketTitle}" created successfully. You can view it [here](${ticketUrl}).`
		)
	}
}
