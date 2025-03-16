import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const movesSchema = defineTable({
	gameId: v.id('games'),
	playerId: v.id('users'),
	row: v.number(),
	col: v.number(),
	symbol: v.union(
		v.literal('X'),
		v.literal('O'),
		v.literal('Square'),
		v.literal('Triangle')
	),
	createdAt: v.string(),
}).index('by_game', ['gameId'])
