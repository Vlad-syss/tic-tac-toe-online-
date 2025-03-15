import { GoogleGenerativeAI } from '@google/generative-ai'
import { v } from 'convex/values'
import { mutation } from './_generated/server'

const client = new GoogleGenerativeAI(process.env.VITE_GEMINI_APIKEY as string)
const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' })

export const aiMakeMove = mutation({
	args: {
		gameId: v.id('games'),
		playerId: v.id('users'),
		board: v.array(
			v.array(
				v.object({
					row: v.number(),
					col: v.number(),
					symbol: v.union(
						v.literal('X'),
						v.literal('O'),
						v.literal('Square'),
						v.literal('Triangle'),
						v.null()
					),
				})
			)
		),
		cacheBuster: v.optional(v.number()),
	},
	handler: async (ctx, { gameId, playerId, board }) => {
		const game = await ctx.db.get(gameId)
		if (!game) {
			console.error('Game not found.')
			return null
		}

		const fieldSize = game.fieldSize
		const symbol = 'X'

		const prompt = `Given this ${fieldSize}x${fieldSize} game board: ${board}, suggest the best move for the AI as a row and column number, zero based, separated by a comma. The available spots are marked as null. For example, if the top right square is available, you would return '0,${fieldSize - 1}'.`

		const result = await model.generateContent(prompt)
		const response = await result.response
		const text = response.text()

		if (!text) {
			console.error('Gemini API returned an empty response.')
			return null
		}

		const aiMove = text.trim()
		const [row, col] = aiMove.split(',').map(Number)

		if (
			isNaN(row) ||
			isNaN(col) ||
			row < 0 ||
			row >= fieldSize ||
			col < 0 ||
			col >= fieldSize
		) {
			console.error('Invalid move format from Gemini:', aiMove)
			return null
		}

		const boardIndex = row * fieldSize + col
		if (board[boardIndex] !== null) {
			console.error('Gemini suggested an occupied square:', aiMove)
			return null
		}

		await ctx.db.insert('moves', {
			gameId,
			playerId: playerId,
			row,
			col,
			symbol: symbol,
			createdAt: new Date().toISOString(),
		})

		const updatedGame = await ctx.db.patch(gameId, {
			updatedAt: new Date().toISOString(),
		})

		return updatedGame
	},
})
