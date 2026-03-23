import { useQuery } from 'convex/react'
import { ArrowLeft, Medal, Trophy } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/shared/ui/Button'
import { Container } from '@/shared/ui/Container'

export const LeaderboardPage = () => {
	const { type } = useParams<{ type: string }>()
	const navigate = useNavigate()

	const isOnline = type === 'online'
	const title = isOnline ? 'Online Leaderboard' : 'AI Leaderboard'

	const players = useQuery(
		isOnline
			? api.users.leaderboard_controller.getTopOnlinePlayers
			: api.users.leaderboard_controller.getTopOfflinePlayers,
		{ limit: 50 }
	)

	return (
		<Container>
			<div className='flex flex-col items-center p-8 space-y-6 w-full max-w-3xl mx-auto'>
				<div className='flex items-center gap-4'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => navigate('/')}
					>
						<ArrowLeft className='w-4 h-4 mr-1' /> Back
					</Button>
					<Trophy className='text-amber-600 dark:text-amber-400' size={36} />
					<h1 className='text-4xl font-bold text-amber-700 dark:text-amber-300'>
						{title}
					</h1>
				</div>

				{!players ? (
					<p className='text-slate-500'>Loading...</p>
				) : players.length === 0 ? (
					<p className='text-slate-500'>No players found yet.</p>
				) : (
					<div className='w-full bg-white dark:bg-slate-800/80 rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700'>
						<table className='w-full'>
							<thead className='bg-slate-100 dark:bg-slate-700/60'>
								<tr>
									<th className='px-4 py-3 text-left'>#</th>
									<th className='px-4 py-3 text-left'>
										Player
									</th>
									<th className='px-4 py-3 text-center'>
										Rating
									</th>
									<th className='px-4 py-3 text-center'>
										Wins
									</th>
									<th className='px-4 py-3 text-center'>
										Games
									</th>
									<th className='px-4 py-3 text-center'>
										Best Streak
									</th>
								</tr>
							</thead>
							<tbody>
								{players.map(player => (
									<tr
										key={player._id}
										className='border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40'
									>
										<td className='px-4 py-3 font-semibold'>
											{player.rank <= 3 ? (
												<Medal
													className={`w-5 h-5 ${
														player.rank === 1
															? 'text-amber-400'
															: player.rank === 2
																? 'text-slate-400 dark:text-slate-500'
																: 'text-amber-600'
													}`}
												/>
											) : (
												player.rank
											)}
										</td>
										<td className='px-4 py-3 flex items-center gap-2'>
											{player.avatarUrl && (
												<img
													src={player.avatarUrl}
													className='w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600'
													alt=''
												/>
											)}
											{player.name}
										</td>
										<td className='px-4 py-3 text-center font-bold text-indigo-600 dark:text-indigo-400'>
											{player.rating}
										</td>
										<td className='px-4 py-3 text-center'>
											{player.totalWins}
										</td>
										<td className='px-4 py-3 text-center'>
											{player.totalGamesPlayed}
										</td>
										<td className='px-4 py-3 text-center'>
											{player.highestWinStreak}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</Container>
	)
}
