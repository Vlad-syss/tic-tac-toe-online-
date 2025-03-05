import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
	...authTables,
	users: defineTable({
		name: v.string(),
		email: v.string(),
		avatarUrl: v.optional(v.string()),
		onlineRating: v.number(),
		offlineRating: v.number(),
	}).index('by_email', ['email']),

	games: defineTable({
		userIds: v.array(v.id('users')),
		winnerId: v.optional(v.id('users')),
		gameStatus: v.string(),
		fieldSize: v.number(),
		isDraw: v.boolean(),
	}),
})
