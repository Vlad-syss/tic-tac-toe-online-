import { authTables } from '@convex-dev/auth/server'
import { defineSchema } from 'convex/server'
import { gamesSchema } from './games/games_schema'
import { movesSchema } from './moves/moves_schema'
import { usersSchema } from './users/users_schema'

export default defineSchema({
	...authTables,
	users: usersSchema,
	games: gamesSchema,
	moves: movesSchema,
})
