import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

export const useUser = () => {
	const user = useQuery(api.users.users_controller.getUser)

	return {
		user,
		isLoading: user === undefined,
	}
}

export const useGetUserById = (userId: Id<'users'>) => {
	const user = useQuery(
		api.users.users_controller.getUserById,
		userId ? { userId } : 'skip'
	)

	return {
		user,
		isLoading: user === undefined,
	}
}
