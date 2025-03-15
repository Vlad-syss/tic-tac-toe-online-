import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const startNewGame = mutation({
	args: {
		userIds: v.array(v.id('users')),
		gameMode: v.union(v.literal('AI'), v.literal('Online'), v.literal('2v2')),
		fieldSize: v.number(),
	},
	handler: async (ctx, { userIds, gameMode, fieldSize }) => {
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
