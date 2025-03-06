import { mutation, query } from './_generated/server'

export const store = mutation({
	args: {},
	handler: async ctx => {
		const userIdentity = await ctx.auth.getUserIdentity() // get detailes about current authincated user
		if (!userIdentity) {
			throw new Error('Called storeUser without authentication present')
		}
		console.log(userIdentity)

		const existingUser = await ctx.db // check if already store this identity
			.query('users') // get user schema
			.withIndex('by_email', q => q.eq('email', userIdentity.email)) // get user by email
			.unique() // only unique data

		if (existingUser) {
			// If name or avatar changed, update the existing user
			const updates: Record<string, any> = {}
			if (existingUser.name !== userIdentity.name) {
				updates.name = userIdentity.name
			}
			if (
				userIdentity.picture &&
				existingUser.avatarUrl !== userIdentity.picture
			) {
				updates.avatarUrl = userIdentity.picture
			}

			if (Object.keys(updates).length > 0) {
				await ctx.db.patch(existingUser._id, updates)
			}

			return existingUser._id
		}

		return await ctx.db.insert('users', {
			// insert the user
			name: userIdentity.nickname ?? 'Anonymous',
			email: userIdentity.email ?? '',
			avatarUrl: userIdentity.pictureUrl ?? '',
			// adittional lines for convex
			onlineRating: 1000,
			offlineRating: 1000,
		})
	},
})

export const getUser = query({
	args: {},
	handler: async ctx => {
		const userIdentity = await ctx.auth.getUserIdentity() // get detailes about current authincated user
		if (!userIdentity) {
			throw new Error('Called storeUser without authentication present')
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
