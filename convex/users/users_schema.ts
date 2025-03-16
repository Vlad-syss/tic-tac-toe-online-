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
	totalWins: v.number(),
	isAI: v.optional(v.boolean()),
}).index('by_email', ['email'])
