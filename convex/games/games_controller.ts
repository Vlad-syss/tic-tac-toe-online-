import { v } from 'convex/values'
import { Doc } from '../_generated/dataModel'
import { mutation, query } from '../_generated/server'

export const startNewGame = mutation({
	args: {
		userIds: v.array(v.id('users')),
		gameMode: v.union(v.literal('AI'), v.literal('Online'), v.literal('2v2')),
		fieldSize: v.number(),
	},
	handler: async (ctx, { userIds, gameMode, fieldSize }) => {
		console.log('Creating game with users:', userIds)
		const createdAt = new Date().toISOString()
		const updatedAt = createdAt

		const game = await ctx.db.insert('games', {
			userIds,
			gameStatus: 'waiting',
			gameMode,
			fieldSize,
			isDraw: false,
			createdAt,
			updatedAt,
		})

		return game
	},
})

export const getGame = query({
	args: {
		gameId: v.union(v.id('games'), v.null()),
	},
	handler: async (ctx, { gameId }) => {
		if (!gameId) return null
		return await ctx.db.get(gameId)
	},
})

export const updateGameStatus = mutation({
	args: {
		gameId: v.id('games'),
		gameStatus: v.union(
			v.literal('waiting'),
			v.literal('in_progress'),
			v.literal('completed'),
			v.literal('canceled')
		),
		winnerId: v.optional(v.id('users')),
		isDraw: v.optional(v.boolean()),
	},
	handler: async (ctx, { gameId, gameStatus, winnerId, isDraw }) => {
		const game = await ctx.db.get(gameId)
		if (!game) {
			throw new Error('Game not found')
		}

		const updates: Partial<Doc<'games'>> = {
			gameStatus,
			updatedAt: new Date().toISOString(),
		}

		if (winnerId !== undefined) {
			updates.winnerId = winnerId
		}

		if (isDraw !== undefined) {
			updates.isDraw = isDraw
		}

		await ctx.db.patch(gameId, updates)

		// No need for internal calls here.

		return gameId
	},
})
