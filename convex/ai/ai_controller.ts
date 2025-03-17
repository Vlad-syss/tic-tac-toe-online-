import { GoogleGenerativeAI } from '@google/generative-ai'
import { v } from 'convex/values'
import { api } from '../_generated/api' // Import api
import { Id } from '../_generated/dataModel'
import { mutation } from '../_generated/server'

const client = new GoogleGenerativeAI(process.env.VITE_GEMINI_APIKEY as string)
const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' })

export const createGameWithAI = mutation({
	args: {
		userId: v.id('users'),
		fieldSize: v.number(),
	},
	handler: async (ctx, { userId, fieldSize }) => {
		const aiPlayer = await ctx.db.insert('users', {
			name: 'AI Player',
			onlineRating: 1500,
			offlineRating: 1500,
			totalGamesPlayed: 0,
			highestWinStreak: 0,
			totalWins: 0,
		})

		const board = Array.from({ length: fieldSize }, (_, rowIndex) =>
			Array.from({ length: fieldSize }, (_, colIndex) => ({
				symbol: '' as 'X' | 'O' | 'Square' | 'Triangle' | '',
				row: rowIndex,
				col: colIndex,
			}))
		)

		const game = await ctx.db.insert('games', {
			userIds: [userId, aiPlayer],
			gameStatus: 'in_progress',
			gameMode: 'AI',
			fieldSize,
			isDraw: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			board,
			currentTurn: userId, // User goes first
		})

		return game
	},
})

export const recordAIMove = mutation({
	args: {
		gameId: v.id('games'),
		row: v.number(),
		col: v.number(),
	},
	handler: async (ctx, { gameId, row, col }) => {
		const game = await ctx.db.get(gameId)
		if (!game) {
			console.error('Game not found.')
			return { success: false }
		}

		const newBoard = game.board.map((rowArr, rowIndex) =>
			rowArr.map((cell, colIndex) =>
				rowIndex === row && colIndex === col
					? { ...cell, symbol: 'O' as 'X' | 'O' | 'Square' | 'Triangle' | '' }
					: cell
			)
		)

		await ctx.db.patch(gameId, {
			board: newBoard,
			updatedAt: new Date().toISOString(),
			currentTurn: game.userIds[0] as Id<'users'>,
		})

		return { success: true }
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
		cacheBuster: v.optional(v.number()),
	},
	handler: async (ctx, { gameId, playerId }) => {
		const game = await ctx.db.get(gameId)
		if (!game) {
			console.error('Game not found.')
			return null
		}

		const board = game.board

		ctx.scheduler.runAfter(0, api.ai.ai_actions.generateAIMove, {
			board,
			fieldSize: game.fieldSize,
			gameId,
			playerId,
		})

		return { scheduled: true }
	},
})
