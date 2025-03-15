import { GameModes } from '../main/game'
import { Leaderboard } from '../main/leaderboard'

export function Home() {
	return (
		<div className='flex flex-col flex-[1_0_auto] items-center space-y-8 px-4 py-8'>
			<h1 className='text-5xl font-bold text-green-900'>Tic-Tac-Toe Arena</h1>
			<div className='gap-2 grid grid-cols-[1.5fr_1fr]'>
				<GameModes />
				<Leaderboard />
			</div>
		</div>
	)
}
