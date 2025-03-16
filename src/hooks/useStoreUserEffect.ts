import { useAuth0 } from '@auth0/auth0-react'
import { useConvexAuth, useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

export function useStoreUserEffect() {
	const { isLoading, isAuthenticated } = useConvexAuth()
	const { user } = useAuth0()
	const [userId, setUserId] = useState<Id<'users'> | null>(null)
	const storeUser = useMutation(api.users.users_controller.store)

	useEffect(() => {
		if (!isAuthenticated) {
			return
		}

		async function createUser() {
			const id = await storeUser()
			setUserId(id)
		}

		createUser()
		return () => setUserId(null)
	}, [isAuthenticated, storeUser, user?.id])

	return {
		isLoading: isLoading || (isAuthenticated && userId === null),
		isAuthenticated: isAuthenticated && userId !== null,
	}
}
