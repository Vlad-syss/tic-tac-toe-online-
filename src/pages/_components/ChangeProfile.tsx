import { LoaderCircle, Upload } from 'lucide-react'
import { FC, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { Button } from '../../components/Button'
import { useChangeUser } from '../../hooks'
import { UserType } from '../../types'

export const ProfileChange: FC<UserType> = ({ name, avatarUrl }) => {
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

	return (
		<div className='w-full'>
			<div className='space-y-4'>
				<h3 className='text-xl font-semibold text-green-800'>Edit Profile</h3>
				<input
					type='text'
					value={newName}
					onChange={handleNameChange}
					className='w-full px-4 py-3 border border-green-300 placeholder:text-green-800 text-green-900  rounded-md outline-0'
					placeholder='Enter your name'
				/>
				<input
					type='url'
					value={newAvatarUrl}
					onChange={handleAvatarUrlChange}
					className='w-full px-4 py-3 border border-green-300 placeholder:text-green-800 text-green-900 rounded-md outline-0'
					placeholder='Enter avatar image URL'
				/>
				<Button
					size='costum'
					className='w-full flex gap-2 items-center py-4 mt-4 text-white bg-green-600 hover:bg-green-700 rounded-md'
					onClick={handleUpdateProfile} // Trigger the update on button click
				>
					{isLoading ? (
						<LoaderCircle className='animate-spin w-5 h-5' />
					) : (
						<>
							Save Changes
							<Upload />
						</>
					)}
				</Button>
			</div>
			<Toaster />
		</div>
	)
}
