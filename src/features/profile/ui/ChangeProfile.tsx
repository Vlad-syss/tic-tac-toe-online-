import { LoaderCircle, Upload } from 'lucide-react'
import { FC } from 'react'
import { Toaster } from 'react-hot-toast'
import { Button } from '@/shared/ui/Button'
import { useChangeProfile } from '@/features/profile'
import { UserType } from '@/entities/user'

export const ProfileChange: FC<UserType> = ({ name, avatarUrl }) => {
	const {
		handleAvatarUrlChange,
		handleNameChange,
		handleUpdateProfile,
		isLoading,
		newAvatarUrl,
		newName,
	} = useChangeProfile({ name, avatarUrl })

	return (
		<div className='w-full'>
			<div className='space-y-4'>
				<h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Edit Profile</h3>
				<input
					type='text'
					value={newName}
					onChange={handleNameChange}
					className='w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 rounded-md outline-0'
					placeholder='Enter your name'
				/>
				<input
					type='url'
					value={newAvatarUrl}
					onChange={handleAvatarUrlChange}
					className='w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 rounded-md outline-0'
					placeholder='Enter avatar image URL'
				/>
				<Button
					size='custom'
					className='w-full flex gap-2 items-center py-4 mt-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md'
					onClick={handleUpdateProfile}
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
