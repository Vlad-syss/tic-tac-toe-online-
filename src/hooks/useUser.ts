import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const useUser = () => {
	const user = useQuery(api.users.users_controller.getUser)

	return {
		user,
		isLoading: user === undefined,
	}
}
