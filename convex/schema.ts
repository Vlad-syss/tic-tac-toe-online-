import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
	...authTables,
	users: defineTable({
		name: v.string(),
		email: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
		onlineRating: v.number(),
		offlineRating: v.number(),
		totalGamesPlayed: v.number(),
		highestWinStreak: v.number(),
		totalWins: v.number(),
	}).index('by_email', ['email']),

	games: defineTable({
		userIds: v.array(v.id('users')),
		winnerId: v.optional(v.id('users')),
		gameStatus: v.union(
			v.literal('waiting'),
			v.literal('in_progress'),
			v.literal('completed'),
			v.literal('canceled')
		),
		gameMode: v.union(v.literal('AI'), v.literal('Online'), v.literal('2v2')),
		fieldSize: v.number(),
		isDraw: v.boolean(),
		createdAt: v.string(),
		updatedAt: v.string(),
	}).index('by_status', ['gameStatus']),

	moves: defineTable({
		gameId: v.id('games'),
		playerId: v.id('users'),
		row: v.number(),
		col: v.number(),
		symbol: v.string(), // Allowing any symbol
		createdAt: v.string(),
	}).index('by_game', ['gameId']),
})
