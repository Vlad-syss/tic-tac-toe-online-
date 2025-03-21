import { LoaderCircle } from 'lucide-react'
import { useUser } from '../../hooks'
import { ProfileChange, StatsProfile } from '../_components'

export function ProfilePage() {
	const { user, isLoading } = useUser()

	if (isLoading) {
		return <LoaderCircle className='animate-spin w-5 h-5' />
	}
	if (!user) return <p>User not found</p>

	return (
		<div className='flex flex-col gap-6 w-full flex-[1_0_auto] max-w-6xl mx-auto'>
			<div className='w-full p-6 border-b-3 border-b-green-300'>
				<div className='flex flex-row items-center'>
					<img
						src={user?.avatarUrl?.split('=')[0] || '/default-avatar.png'}
						alt='Avatar'
						width={150}
						height={150}
						className='rounded-full mr-6 border-2 border-green-400'
					/>
					<div className='flex gap-3'>
						<div className='flex flex-col'>
							<h1 className='text-2xl font-bold text-gray-800'>
								Your Profile:
							</h1>
							<h2 className='text-lg text-[#2a680d]'>{user.name}</h2>
							<p className='text-sm text-[#1a2017]'>
								{user.email || 'No email provided'}
							</p>
						</div>
						<div className='h-max'>
							<p className='font-bold text-sm text-gray-800'>
								#Rank in Leaderboard
							</p>
							<span className='text-xs font-semibold text-green-800'>
								Not Ranked
							</span>
						</div>

						<div className=' pl-3 border-l-2 border-l-gray-800 h-max'>
							<p className='font-bold text-sm text-gray-800'>#Win/Loss Ratio</p>
							<span className='text-xs font-semibold text-green-800'>
								Not Available
							</span>
						</div>
					</div>
				</div>
			</div>

			<StatsProfile {...user} />
			<ProfileChange {...user} />
		</div>
	)
}
