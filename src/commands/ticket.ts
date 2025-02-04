import { Client } from '@notionhq/client'
import {
	ChatInputCommandInteraction,
	ForumChannel,
	SlashCommandBuilder,
	ThreadChannel,
} from 'discord.js'
import dotenv from 'dotenv'
import { Command } from '../types/command'

dotenv.config()

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || ''
const NOTION_EPIC_ID = process.env.NOTION_EPIC_ID || ''

// Function to clean up mentions from the message content
const cleanMessageContent = (content: string) => {
	return content.replace(/<@!?&?\d+>/g, '').trim()
}

// Function to generate rich text from message content
const generateRichText = (content: string) => {
	// Find links and wrap them in rich text link objects
	const urlRegex = /(https?:\/\/[^\s]+)/g
	const urlMatches = [...content.matchAll(urlRegex)]
	let richTextContent = []
	let lastIndex = 0

	// Process each match
	urlMatches.forEach((match) => {
		const [url] = match
		const start = match.index || 0
		const end = start + url.length

		// Push the text before the URL as a plain text block
		if (start > lastIndex) {
			richTextContent.push({
				text: { content: content.slice(lastIndex, start) },
			})
		}

		// Push the URL as a link
		richTextContent.push({
			text: {
				content: url,
				link: { url },
			},
		})

		lastIndex = end
	})

	// Push the remaining text after the last URL
	if (lastIndex < content.length) {
		richTextContent.push({
			text: { content: content.slice(lastIndex) },
		})
	}

	return richTextContent
}

export default (): Command => {
	return {
		slashCommandConfig: new SlashCommandBuilder()
			.setName('ticket')
			.setDescription('Create a Notion ticket')
			.addStringOption((option) =>
				option
					.setName('priority')
					.setDescription('Choose priority of the ticket')
					.setRequired(true)
					.addChoices(
						{ name: '🔥 FAST TRACK 🔥', value: '🔥 FAST TRACK 🔥' },
						{ name: '#P1', value: '#P1' },
						{ name: '#P2', value: '#P2' },
						{ name: '#P3', value: '#P3' },
						{ name: '#P4', value: '#P4' }
					)
			)
			.addStringOption((option) =>
				option
					.setName('team')
					.setDescription('Choose team of the ticket')
					.setRequired(true)
					.addChoices(
						{ name: 'Tech - App', value: 'Tech - App' },
						{ name: 'Tech - R&D', value: 'Tech - R&D' },
						{ name: 'Tech - DevOps', value: 'Tech - DevOps' },
						{ name: 'Product', value: 'Product' },
						{ name: 'Tech - Design', value: 'Tech - Design' }
					)
			),
		execute: async (interaction: ChatInputCommandInteraction) => {
			const messageChannel = interaction.channel

			if (
				messageChannel instanceof ThreadChannel ||
				messageChannel instanceof ForumChannel
			) {
				// Handle thread or forum channel
			} else {
				await interaction.reply({
					content:
						'The channel does not have a `name` property or is unsupported.',
					ephemeral: true,
				})
				return
			}

			const ticketTitle = messageChannel.name

			// Defer the reply to give more time for processing
			await interaction.deferReply()

			try {
				// Extract priority and team options
				const priority = interaction.options.getString('priority') ?? '#P1'
				const team = interaction.options.getString('team') ?? 'Tech - App'

				// Create a page in Notion
				const response = await notion.pages.create({
					parent: { type: 'database_id', database_id: NOTION_DATABASE_ID },
					properties: {
						Name: {
							title: [{ text: { content: ticketTitle } }],
						},
						'👫 Team': {
							multi_select: [{ name: team }],
						},
						'🎯 Priority': {
							select: { name: priority },
						},
						'🏔️ Epic': {
							relation: [{ id: NOTION_EPIC_ID }],
						},
					},
				})

				// Fetch the latest messages to include in the ticket
				const messages = (await messageChannel.messages.fetch({ limit: 10 }))
					.filter(
						(msg) =>
							!msg.content.toLowerCase().startsWith('/ticket') &&
							msg.content !== 'Creating ticket...'
					)
					.reverse()

				// Clean up message content by removing mentions and add author
				const cleanedMessages = messages.map((msg) => {
					return {
						...msg,
						content: cleanMessageContent(msg.content),
						author: msg.author.username,
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
								{
									text: {
										content:
											'Ticket created by ' +
											interaction.user.username +
											' via The Escapist bot. \n',
									},
								},
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
					...cleanedMessages.map((msg) => ({
						paragraph: {
							rich_text: generateRichText(`${msg.author}:\n${msg.content}\n`),
						},
					}))
				)

				// Append children to the Notion page
				const blockId = response.id
				await notion.blocks.children.append({
					block_id: blockId,
					children: notionChildren,
				})

				// Construct and send the success message
				const ticketUrl = `https://www.notion.so/${response.id.replace(
					/-/g,
					''
				)}`
				const successMessage = `Ticket created successfully. You can view it [here](${ticketUrl}).\n**Title**: \`${ticketTitle}\`\n**Priority**: \`${priority}\`\n**Team**: \`${team}\``

				await interaction.editReply(successMessage)
			} catch (error) {
				console.error('Error creating ticket:', error)
				await interaction.editReply(
					'Failed to create the ticket. Please try again later.'
				)
			}
		},
	}
}
