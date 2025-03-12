import { v } from 'convex/values'
import { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'

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
			// Only update the avatar if needed
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
		})
	},
})

export const getUser = query({
	args: {},
	handler: async ctx => {
		const userIdentity = await ctx.auth.getUserIdentity() // get detailes about current authincated user
		if (!userIdentity) {
			throw new Error('Called getUser without authentication present')
		}

		// Find the user by email
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

export const updateUser = mutation({
	args: { name: v.optional(v.string()), avatarUrl: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const userIdentity = await ctx.auth.getUserIdentity() // Get details about current authenticated user
		if (!userIdentity) {
			throw new Error('Called updateUser without authentication present')
		}

		const existingUser = await ctx.db // Check if user already exists
			.query('users')
			.withIndex('by_email', q => q.eq('email', userIdentity.email))
			.unique() // Ensure only unique data

		if (existingUser !== null) {
			const updates: Partial<{ name: string; avatarUrl?: string }> = {}

			if (args.name !== undefined) {
				updates.name = args.name
			}
			if (args.avatarUrl !== undefined) {
				updates.avatarUrl = args.avatarUrl as string | undefined // Explicitly cast
			}

			if (Object.keys(updates).length > 0) {
				await ctx.db.patch(existingUser._id, updates) // Update only if changes exist
			}

			return existingUser._id
		}

		const userData: {
			tokenIdentifier: string
			name: string
			onlineRating: number
			offlineRating: number
			totalGamesPlayed: number
			highestWinStreak: number
			avatarUrl?: string
		} = {
			tokenIdentifier: userIdentity.tokenIdentifier,
			name: args.name ?? userIdentity.name ?? 'Anonymous',
			onlineRating: 1000, // Default starting rating
			offlineRating: 1000, // Default starting rating
			totalGamesPlayed: 0,
			highestWinStreak: 0,
		}

		if (args.avatarUrl !== undefined) {
			userData.avatarUrl = args.avatarUrl as string | undefined
		}

		return await ctx.db.insert('users', userData)
	},
})
