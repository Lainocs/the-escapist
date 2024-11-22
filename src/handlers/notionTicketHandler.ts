import { Client } from '@notionhq/client'
import { ForumChannel, Message, ThreadChannel } from 'discord.js'
import dotenv from 'dotenv'

dotenv.config()

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || ''
const NOTION_EPIC_ID = process.env.NOTION_EPIC_ID || ''

// Function to clean up mentions from the message content
const cleanMessageContent = (content: string) => {
	return content.replace(/<@!?&?\d+>/g, '').trim()
}

export async function handleNotionTicket(message: Message) {
	if (message.content.toLowerCase().startsWith('/ticket')) {
		const messageChannel = message.channel

		// Initialize the ticket title with the message content
		let ticketTitle = message.content.split(' ').slice(1).join(' ').trim()

		if (
			messageChannel instanceof ThreadChannel ||
			messageChannel instanceof ForumChannel
		) {
			// Use channel name if the title is empty
			if (!ticketTitle) {
				ticketTitle = messageChannel.name
			}
		} else {
			console.log(
				'The channel does not have a `name` property or is unsupported.'
			)
		}

		// Inform the user that the ticket is being created
		await message.reply('Creating ticket...')

		try {
			// Create a page in Notion
			const response = await notion.pages.create({
				parent: { type: 'database_id', database_id: NOTION_DATABASE_ID },
				properties: {
					Name: {
						title: [{ text: { content: ticketTitle } }],
					},
					'👫 Team': {
						multi_select: [{ name: 'Tech - App' }],
					},
					'🎯 Priority': {
						select: { name: '#P1' },
					},
					'🏔️ Epic': {
						relation: [{ id: NOTION_EPIC_ID }],
					},
				},
			})

			// Fetch the latest messages to include in the ticket
			const messages = (await messageChannel.messages.fetch({ limit: 20 }))
				.filter(
					(msg) =>
						!msg.content.toLowerCase().startsWith('/ticket') &&
						msg.content !== 'Creating ticket...'
				)
				.reverse()

			// Clean up message content by removing mentions
			const cleanedMessages = messages.map((msg) => {
				return {
					...msg,
					content: cleanMessageContent(msg.content),
				}
			})

			// Extract URLs from messages
			const urls = cleanedMessages
				.map((msg) => {
					const urlRegex = /(https?:\/\/[^\s]+)/g
					return msg.content.match(urlRegex) || []
				})
				.flat()

			// Extract image URLs from attachments and content
			const imageUrls = cleanedMessages
				.map((msg) => {
					// Check for attachments with image types
					const attachmentImages = msg.attachments.filter((attachment) =>
						attachment.contentType?.startsWith('image/')
					)
					const attachmentUrls = Array.from(attachmentImages.values()).map(
						(attachment) => attachment.url
					)

					// Check for image URLs in message content
					const urlRegex = /(https?:\/\/[^\s]+)/g
					const contentUrls =
						msg.content
							.match(urlRegex)
							?.filter(
								(url) =>
									url.endsWith('.png') ||
									url.endsWith('.jpg') ||
									url.endsWith('.jpeg') ||
									url.endsWith('.gif')
							) || []

					return [...attachmentUrls, ...contentUrls]
				})
				.flat()

			// Create the Notion blocks dynamically
			const notionChildren: any[] = [
				{
					quote: {
						rich_text: [
							{ text: { content: 'Ticket created by The Escapist bot. \n' } },
							{
								text: {
									content: messageChannel.url,
									link: { url: messageChannel.url },
								},
							},
						],
					},
				},
				{
					heading_2: {
						rich_text: [{ text: { content: 'Links' } }],
					},
				},
				{
					paragraph: {
						rich_text: urls.map((url) => ({
							text: { content: url + '\n', link: { url } },
						})),
					},
				},
			]

			// Add images if any
			if (imageUrls.length > 0) {
				notionChildren.push(
					{
						heading_2: {
							rich_text: [{ text: { content: 'Images' } }],
						},
					},
					...imageUrls.map((imageUrl) => ({
						image: {
							type: 'external',
							external: { url: imageUrl },
						},
					}))
				)
			}

			// Add message content with usernames to the ticket
			notionChildren.push(
				{
					heading_2: {
						rich_text: [{ text: { content: 'History' } }],
					},
				},
				{
					paragraph: {
						rich_text: [
							{
								text: {
									content: cleanedMessages
										.map((msg) => `- ${msg.content}`)
										.join('\n'),
								},
							},
						],
					},
				}
			)

			// Append children to the Notion page
			const blockId = response.id
			await notion.blocks.children.append({
				block_id: blockId,
				children: notionChildren,
			})

			// Reply with the link to the ticket
			const ticketUrl = `https://www.notion.so/${response.id.replace(/-/g, '')}`
			await message.reply(
				`Ticket "${ticketTitle}" created successfully. You can view it [here](${ticketUrl}).`
			)
		} catch (error) {
			console.error('Error creating ticket:', error)
			await message.reply(
				'Failed to create the ticket. Please try again later.'
			)
		}
	}
}
