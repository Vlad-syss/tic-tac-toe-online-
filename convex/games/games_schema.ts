import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const gamesSchema = defineTable({
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
	inviteCode: v.optional(v.string()),
	teamAssignments: v.optional(v.array(v.number())),
	currentTurn: v.optional(v.string()),
})
	.index('by_status', ['gameStatus'])
	.index('by_invite_code', ['inviteCode'])
