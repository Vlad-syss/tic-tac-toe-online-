import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useChangeUser } from '.'
import { UserType } from '../types'

export const useChangeProfile = ({
	name,
	avatarUrl,
}: Pick<UserType, 'name' | 'avatarUrl'>) => {
	const { changeUser, isLoading } = useChangeUser()

	const [newName, setNewName] = useState(name)
	const [newAvatarUrl, setNewAvatarUrl] = useState(avatarUrl?.split('=')[0])

	const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setNewName(event.target.value)
	}

	const handleAvatarUrlChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setNewAvatarUrl(event.target.value)
	}

	const handleUpdateProfile = async () => {
		if (!newName || !newAvatarUrl) {
			toast.error('Name and avatar URL cannot be empty.')
			return
		}

		try {
			await changeUser({
				name: newName,
				avatarUrl: newAvatarUrl,
			})
			toast.success('Successfully updated')
		} catch (error) {
			console.error('Error:', error)
			toast.error('Failed to update profile.')
		}
	}

	return {
		handleAvatarUrlChange,
		handleNameChange,
		handleUpdateProfile,
		isLoading,
		newAvatarUrl,
		newName,
	}
}
