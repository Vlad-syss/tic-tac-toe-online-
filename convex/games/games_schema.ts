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
	gameMode: v.union(v.literal('AI'), v.literal('Online'), v.literal('1v1v1v1')),
	fieldSize: v.number(),
	isDraw: v.boolean(),
	createdAt: v.string(),
	updatedAt: v.string(),
	inviteCode: v.optional(v.string()),
	teamAssignments: v.optional(v.array(v.number())),
	currentTurn: v.optional(v.id('users')),
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
					v.literal('')
				),
			})
		)
	),
	userSymbols: v.record(
		v.id('users'),
		v.union(
			v.literal('X'),
			v.literal('O'),
			v.literal('Square'),
			v.literal('Triangle')
		)
	),
})
	.index('by_status', ['gameStatus'])
	.index('by_invite_code', ['inviteCode'])
