import { v } from 'convex/values'
import { query } from '../_generated/server'

export const getTopOnlinePlayers = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { limit }) => {
		const maxResults = limit ?? 50
		const users = await ctx.db
			.query('users')
			.withIndex('by_online_rating')
			.order('desc')
			.filter(q => q.neq(q.field('isAI'), true))
			.take(maxResults)

		return users.map((user, index) => ({
			rank: index + 1,
			_id: user._id,
			name: user.name,
			avatarUrl: user.avatarUrl,
			rating: user.onlineRating,
			totalWins: user.totalWins,
			totalGamesPlayed: user.totalGamesPlayed,
			highestWinStreak: user.highestWinStreak,
		}))
	},
})

export const getUserRank = query({
	args: {
		userId: v.id('users'),
	},
	handler: async (ctx, { userId }) => {
		const user = await ctx.db.get(userId)
		if (!user || user.isAI) return { onlineRank: null, offlineRank: null }

		const onlinePlayers = await ctx.db
			.query('users')
			.withIndex('by_online_rating')
			.order('desc')
			.filter(q => q.neq(q.field('isAI'), true))
			.collect()

		const offlinePlayers = await ctx.db
			.query('users')
			.withIndex('by_offline_rating')
			.order('desc')
			.filter(q => q.neq(q.field('isAI'), true))
			.collect()

		const onlineRank = onlinePlayers.findIndex(p => p._id === userId) + 1
		const offlineRank = offlinePlayers.findIndex(p => p._id === userId) + 1

		return {
			onlineRank: onlineRank > 0 ? onlineRank : null,
			offlineRank: offlineRank > 0 ? offlineRank : null,
		}
	},
})

export const getTopOfflinePlayers = query({
	args: {
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { limit }) => {
		const maxResults = limit ?? 50
		const users = await ctx.db
			.query('users')
			.withIndex('by_offline_rating')
			.order('desc')
			.filter(q => q.neq(q.field('isAI'), true))
			.take(maxResults)

		return users.map((user, index) => ({
			rank: index + 1,
			_id: user._id,
			name: user.name,
			avatarUrl: user.avatarUrl,
			rating: user.offlineRating,
			totalWins: user.totalWins,
			totalGamesPlayed: user.totalGamesPlayed,
			highestWinStreak: user.highestWinStreak,
		}))
	},
})
