import { v } from 'convex/values'
import { Doc } from '../_generated/dataModel'
import { mutation, query } from '../_generated/server'

export const store = mutation({
	args: {},
	handler: async ctx => {
		const userIdentity = await ctx.auth.getUserIdentity()
		if (!userIdentity) {
			throw new Error('Called storeUser without authentication present')
		}

		const existingUser: Doc<'users'> | null = await ctx.db
			.query('users')
			.withIndex('by_email', q => q.eq('email', userIdentity.email))
			.unique()

		if (existingUser) {
			const updates: Partial<Doc<'users'>> = {}
			if (
				userIdentity.picture &&
				existingUser.avatarUrl !== userIdentity.picture
			) {
				updates.avatarUrl = userIdentity.picture as string | undefined
			}

			if (Object.keys(updates).length > 0) {
				await ctx.db.patch(existingUser._id, updates)
			}

			return existingUser._id
		}

		return await ctx.db.insert('users', {
			name: userIdentity.nickname ?? 'Anonymous',
			email: userIdentity.email ?? '',
			avatarUrl: (userIdentity.picture as string | undefined) ?? '',
			onlineRating: 1000,
			offlineRating: 1000,
			totalGamesPlayed: 0,
			highestWinStreak: 0,
			totalWins: 0,
		})
	},
})

export const getUser = query({
	args: {},
	handler: async ctx => {
		const userIdentity = await ctx.auth.getUserIdentity()
		if (!userIdentity) {
			throw new Error('Called getUser without authentication present')
		}

		const user = await ctx.db
			.query('users')
			.withIndex('by_email', q => q.eq('email', userIdentity.email))
			.unique()

		if (!user) {
			throw new Error('User not found')
		}

		return user
	},
})

export const getUserById = query({
	args: {
		userId: v.id('users'),
	},
	handler: async (ctx, args) => {
		if (args.userId === undefined) {
			return null
		}

		const users = await ctx.db
			.query('users')
			.filter(q => q.eq(q.field('_id'), args.userId))
			.collect()

		if (users.length === 0) {
			return null
		}

		return users[0]
	},
})

export const updateUser = mutation({
	args: { name: v.optional(v.string()), avatarUrl: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const userIdentity = await ctx.auth.getUserIdentity()
		if (!userIdentity) {
			throw new Error('Called updateUser without authentication present')
		}

		const existingUser = await ctx.db
			.query('users')
			.withIndex('by_email', q => q.eq('email', userIdentity.email))
			.unique()

		if (existingUser !== null) {
			const updates: Partial<{ name: string; avatarUrl?: string }> = {}

			if (args.name !== undefined) {
				updates.name = args.name
			}
			if (args.avatarUrl !== undefined) {
				updates.avatarUrl = args.avatarUrl as string | undefined
			}

			if (Object.keys(updates).length > 0) {
				await ctx.db.patch(existingUser._id, updates)
			}

			return existingUser._id
		}

		const userData: {
			name: string
			email: string
			onlineRating: number
			offlineRating: number
			totalGamesPlayed: number
			highestWinStreak: number
			avatarUrl?: string
			totalWins: number
		} = {
			name: args.name ?? userIdentity.name ?? 'Anonymous',
			email: userIdentity.email ?? '',
			onlineRating: 1000,
			offlineRating: 1000,
			totalGamesPlayed: 0,
			highestWinStreak: 0,
			totalWins: 0,
		}

		if (args.avatarUrl !== undefined) {
			userData.avatarUrl = args.avatarUrl as string | undefined
		}

		return await ctx.db.insert('users', userData)
	},
})
