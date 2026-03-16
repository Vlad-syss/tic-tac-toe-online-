import { useQuery } from 'convex/react'
import { ArrowLeft, Medal, Trophy } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { api } from '../../../convex/_generated/api'
import { Button } from '../../components/Button'
import { Container } from '../../components/Container'

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
						variant='greenOutline'
						size='sm'
						onClick={() => navigate('/')}
					>
						<ArrowLeft className='w-4 h-4 mr-1' /> Back
					</Button>
					<Trophy className='text-yellow-600' size={36} />
					<h1 className='text-4xl font-bold text-yellow-800'>
						{title}
					</h1>
				</div>

				{!players ? (
					<p className='text-gray-500'>Loading...</p>
				) : players.length === 0 ? (
					<p className='text-gray-500'>No players found yet.</p>
				) : (
					<div className='w-full bg-white rounded-lg shadow-lg overflow-hidden'>
						<table className='w-full'>
							<thead className='bg-yellow-100'>
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
										className='border-t hover:bg-yellow-50'
									>
										<td className='px-4 py-3 font-semibold'>
											{player.rank <= 3 ? (
												<Medal
													className={`w-5 h-5 ${
														player.rank === 1
															? 'text-yellow-500'
															: player.rank === 2
																? 'text-gray-400'
																: 'text-orange-400'
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
													className='w-8 h-8 rounded-full border'
													alt=''
												/>
											)}
											{player.name}
										</td>
										<td className='px-4 py-3 text-center font-bold text-green-700'>
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
