import { LoaderCircle, MoveDiagonal } from 'lucide-react'
import { useUser } from '../hooks'
import { Button } from './Button'

export const Profile = () => {
	const { user, isLoading } = useUser()
	console.log(user)

	if (isLoading) {
		return <LoaderCircle className='animate-spin w-5 h-5' />
	}
	if (!user) return <p>User not found</p>
	return (
		<div className='flex gap-2 items-top group cursor-pointer'>
			<div className='flex gap-1 select-none'>
				<img
					src={user.avatarUrl?.split('=')[0]}
					width={50}
					height={50}
					alt='profile_img'
					className='rounded'
				/>
				<div className='flex flex-col gap-0.5'>
					<h4 className='text-sm'>{user.name}</h4>
					<p className='text-lime-800 text-xs leading-2'>
						Rating online:{' '}
						<span className='font-semibold'>{user.onlineRating}</span>
					</p>
					<p className='text-lime-800 text-xs leading-5'>
						Rating offline:{' '}
						<span className='font-semibold'>{user.onlineRating}</span>
					</p>
				</div>
			</div>
			<Button
				size='costum'
				variant='greenOutline'
				className='h-5 w-5 p-0 border-lime-700 rounded-sm group-hover:bg-lime-400/40 hover:bg-lime-400/40 cursor-pointer'
			>
				<MoveDiagonal className='text-lime-700 h-3 w-3' />
			</Button>
		</div>
	)
}
