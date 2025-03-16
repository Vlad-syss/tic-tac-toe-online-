import { GoogleGenerativeAI } from '@google/generative-ai'
import { v } from 'convex/values'
import { api } from '../_generated/api' // Import api
import { mutation } from '../_generated/server'

const client = new GoogleGenerativeAI(process.env.VITE_GEMINI_APIKEY as string)
const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' })

export const createGameWithAI = mutation({
	args: {
		userId: v.id('users'),
		fieldSize: v.number(),
	},
	handler: async (ctx, { userId, fieldSize }) => {
		// Create AI player
		const aiPlayer = await ctx.db.insert('users', {
			name: 'AI Player',
			onlineRating: 1500,
			offlineRating: 1500,
			totalGamesPlayed: 0,
			highestWinStreak: 0,
			totalWins: 0,
		})

		const game = await ctx.db.insert('games', {
			userIds: [userId, aiPlayer],
			gameStatus: 'in_progress',
			gameMode: 'AI',
			fieldSize,
			isDraw: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		})

		// Return the game ID
		return game
	},
})

export const recordAIMove = mutation({
	args: {
		gameId: v.id('games'),
		playerId: v.id('users'),
		row: v.number(),
		col: v.number(),
	},
	handler: async (ctx, { gameId, playerId, row, col }) => {
		try {
			await ctx.db.insert('moves', {
				gameId,
				playerId,
				row,
				col,
				symbol: 'O', // AI always uses 'O'
				createdAt: new Date().toISOString(),
			})

			await ctx.db.patch(gameId, {
				updatedAt: new Date().toISOString(),
			})

			return { success: true }
		} catch (error) {
			console.error('Error inserting move:', error)
			return { success: false }
		}
	},
})

export const deleteAIUser = mutation({
	args: {
		aiUserId: v.id('users'),
	},
	handler: async (ctx, { aiUserId }) => {
		const aiUser = await ctx.db.get(aiUserId)
		if (!aiUser) {
			console.error('AI user not found.')
			return null
		}

		await ctx.db.delete(aiUserId)

		return { success: true }
	},
})

export const aiMakeMove = mutation({
	args: {
		gameId: v.id('games'),
		playerId: v.id('users'),
		board: v.optional(
			v.array(
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

		if (!board) {
			console.error('Board is undefined in aiMakeMove mutation.')
			return null
		}

		// Schedule the action to run after this mutation completes
		ctx.scheduler.runAfter(0, api.ai.ai_actions.generateAIMove, {
			board,
			fieldSize: game.fieldSize,
			gameId,
			playerId,
		})

		return { scheduled: true }
	},
})
