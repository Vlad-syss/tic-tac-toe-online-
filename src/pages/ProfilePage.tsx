import { LoaderCircle, Upload } from 'lucide-react'
import { Button } from '../components/Button'
import { useUser } from '../hooks'

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
						src={user?.avatarUrl?.split('=')[0]}
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

			<div className='grid grid-cols-4 gap-3 text-sm text-gray-700'>
				<div>
					<p className='font-medium'> Total Games</p>
					<p className='text-lg font-semibold'>{user.totalGamesPlayed || 0}</p>
				</div>

				<div>
					<p className='font-medium'>Highest Win Strick</p>
					<p className='text-lg font-semibold'>{user.highestWinStreak || 0}</p>
				</div>

				<div>
					<p className='font-medium'>Online Rating</p>
					<p className='text-lg font-semibold text-green-700'>
						{user.onlineRating || 'Not Rated'}
					</p>
				</div>

				<div>
					<p className='font-medium'>Offline Rating</p>
					<p className='text-lg font-semibold text-green-700'>
						{user.offlineRating || 'Not Rated'}
					</p>
				</div>
			</div>

			<div className='w-full'>
				<div className='space-y-4'>
					<h3 className='text-xl font-semibold text-green-800'>Edit Profile</h3>
					<input
						type='text'
						defaultValue={user.name}
						className='w-full px-4 py-3 border border-green-300 placeholder:text-green-800 text-green-900  rounded-md outline-0'
						placeholder='Enter your name'
					/>
					<input
						type='url'
						defaultValue={user?.avatarUrl?.split('=')[0]}
						className='w-full px-4 py-3 border border-green-300 placeholder:text-green-800 text-green-900 rounded-md outline-0'
						placeholder='Enter avatar image URL'
					/>
					<Button
						size='costum'
						className='w-full flex gap-2 items-center py-4 mt-4 text-white bg-green-600 hover:bg-green-700 rounded-md'
					>
						Save Changes
						<Upload />
					</Button>
				</div>
			</div>
		</div>
	)
}
