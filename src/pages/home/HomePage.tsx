import { Link } from 'react-router'
import { History } from 'lucide-react'
import { GameModes } from '@/features/game-modes'
import { Leaderboard } from '@/features/leaderboard'

export function Home() {
	return (
		<div className='flex flex-col flex-[1_0_auto] items-center space-y-8 px-4 py-8'>
			<h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white'>Tic-Tac-Toe Arena</h1>
			<div className='gap-4 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] w-full'>
				<GameModes />
				<Leaderboard />
			</div>
			<Link
				to='/history'
				className='flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md'
			>
				<History className='w-5 h-5' />
				Game History
			</Link>
		</div>
	)
}
