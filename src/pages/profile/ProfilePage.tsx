import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useUser } from '@/features/auth'
import { ProfileChange, StatsProfile } from '@/features/profile'
import { ProfilePageSkeleton } from '@/shared/ui/skeletons'
import { Id } from '../../../convex/_generated/dataModel'

export function ProfilePage() {
	const { user, isLoading } = useUser()
	const rank = useQuery(
		api.users.leaderboard_controller.getUserRank,
		user?._id ? { userId: user._id as Id<'users'> } : 'skip'
	)

	if (isLoading) {
		return <ProfilePageSkeleton />
	}
	if (!user) return <p>User not found</p>

	const totalLosses = user.totalGamesPlayed - user.totalWins

	return (
		<div className='flex flex-col gap-6 w-full flex-[1_0_auto] max-w-6xl mx-auto'>
			<div className='w-full p-4 sm:p-6 border-b-3 border-b-slate-200 dark:border-b-slate-700'>
				<div className='flex flex-col sm:flex-row items-center'>
					<img
						src={user?.avatarUrl?.split('=')[0] || '/default-avatar.png'}
						alt='Avatar'
						className='rounded-full mr-0 sm:mr-6 mb-4 sm:mb-0 border-2 border-indigo-300 dark:border-indigo-500/50 w-24 h-24 sm:w-[150px] sm:h-[150px]'
					/>
					<div className='flex flex-col sm:flex-row gap-3 text-center sm:text-left'>
						<div className='flex flex-col'>
							<h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
								Your Profile:
							</h1>
							<h2 className='text-lg text-indigo-600 dark:text-indigo-400'>{user.name}</h2>
							<p className='text-sm text-slate-600 dark:text-slate-400'>
								{user.email || 'No email provided'}
							</p>
						</div>
						<div className='h-max'>
							<p className='font-bold text-sm text-slate-900 dark:text-white'>
								#Rank in Leaderboard
							</p>
							<span className='text-xs font-semibold text-indigo-600 dark:text-indigo-400'>
								{rank?.onlineRank ? `#${rank.onlineRank}` : 'Not Ranked'}
							</span>
						</div>

						<div className=' pl-3 border-l-2 border-l-slate-300 dark:border-l-slate-600 h-max'>
							<p className='font-bold text-sm text-slate-900 dark:text-white'>#Win/Loss Ratio</p>
							<span className='text-xs font-semibold text-indigo-600 dark:text-indigo-400'>
								{user.totalGamesPlayed > 0
									? `${user.totalWins}W - ${totalLosses}L`
									: 'No Games Yet'}
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
