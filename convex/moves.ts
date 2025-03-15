import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const makeMove = mutation({
	args: {
		gameId: v.id('games'),
		playerId: v.id('users'),
		row: v.number(),
		col: v.number(),
		symbol: v.string(),
	},
	handler: async (ctx, { gameId, playerId, row, col, symbol }) => {
		const createdAt = new Date().toISOString()

		const move = await ctx.db.insert('moves', {
			gameId,
			playerId,
			row,
			col,
			symbol,
			createdAt,
		})

		await ctx.db.patch(gameId, {
			updatedAt: createdAt,
		})

		return move
	},
})

export const getMoves = query({
	args: {
		gameId: v.id('games'),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('moves')
			.withIndex('by_game', q => q.eq('gameId', args.gameId))
			.collect()
	},
})
