import { useMutation } from 'convex/react'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'

export const useChangeUser = () => {
	const [isLoading, setIsLoading] = useState(false)
	const updateUser = useMutation(api.users.updateUser)

	const changeUser = async (args: { name?: string; avatarUrl?: string }) => {
		setIsLoading(true)
		try {
			const userId = await updateUser(args)
			return userId
		} catch (error) {
			console.error('Error updating user:', error)
			throw error
		} finally {
			setIsLoading(false)
		}
	}

	return {
		changeUser,
		isLoading,
	}
}
