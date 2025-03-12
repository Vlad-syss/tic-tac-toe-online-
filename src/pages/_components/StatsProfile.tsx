import { UserType } from '../../types'

export const StatsProfile = (user: UserType) => {
	return (
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
	)
}
