import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const usersSchema = defineTable({
	name: v.string(),
	email: v.optional(v.string()),
	avatarUrl: v.optional(v.string()),
	onlineRating: v.number(),
	offlineRating: v.number(),
	totalGamesPlayed: v.number(),
	highestWinStreak: v.number(),
	currentWinStreak: v.optional(v.number()),
	totalWins: v.number(),
	isAI: v.optional(v.boolean()),
})
	.index('by_email', ['email'])
	.index('by_online_rating', ['onlineRating'])
	.index('by_offline_rating', ['offlineRating'])
