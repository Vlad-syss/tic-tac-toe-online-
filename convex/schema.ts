import { defineSchema } from 'convex/server'
import { gamesSchema } from './games/games_schema'
import { usersSchema } from './users/users_schema'

export default defineSchema({
	users: usersSchema,
	games: gamesSchema,
})
