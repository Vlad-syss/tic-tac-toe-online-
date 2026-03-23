import { clsx as cn } from 'clsx'
import { Circle, Computer, Gamepad2, Square, Triangle, X } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/shared/ui/Button'
import { useGameApi } from '@/features/game-board'
import { useUser } from '@/features/auth'
import { generateInviteCode } from '@/shared/lib/inviteCode'
import { useGameSettingsStore } from '@/shared/store/useGameSettingsStore'

export const GameModes = () => {
	const { user } = useUser()
	const navigate = useNavigate()
	const { boardSize, setBoardSize } = useGameSettingsStore()
	const { startGameWithAI, startNewGame } = useGameApi(null)

	const startGame = async (mode: string) => {
		if (user === undefined) return
		if (mode === 'ai') {
			const newGame = await startGameWithAI(user?._id, boardSize)
			if (newGame) {
				navigate(`/game/${mode}?size=${boardSize}&gameId=${newGame._id}`)
			}
		} else if (mode === 'online') {
			const code = generateInviteCode()
			const gameId = await startNewGame({
				userIds: [user._id],
				gameMode: 'Online' as const,
				fieldSize: boardSize,
				firstPlayerId: user._id,
				inviteCode: code,
			})
			if (gameId) {
				navigate(
					`/game/online?size=${boardSize}&gameId=${gameId}&invite=${code}`
				)
			}
		} else if (mode === '1v1v1v1') {
			const code = generateInviteCode()
			const gameId = await startNewGame({
				userIds: [user._id],
				gameMode: '1v1v1v1' as const,
				fieldSize: boardSize,
				firstPlayerId: user._id,
				inviteCode: code,
			})
			if (gameId) {
				navigate(
					`/game/1v1v1v1?size=${boardSize}&gameId=${gameId}&invite=${code}`
				)
			}
		}
	}

	return (
		<div className='flex flex-col items-center space-y-6 p-4 sm:p-6 lg:p-8 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-lg w-full'>
			<h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white'>Game Modes</h2>
			<p className='text-lg text-slate-500 dark:text-slate-400'>
				Welcome {user?.name || 'Guest'}, choose your challenge!
			</p>

			<div className='flex flex-wrap gap-2'>
				<Button
					variant='ghost'
					size='custom'
					className={cn(
						'px-4 py-2 rounded-lg text-white hover:bg-indigo-600',
						boardSize === 3 && 'bg-indigo-600',
						boardSize !== 3 && 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
					)}
					onClick={() => setBoardSize(3)}
				>
					3x3
				</Button>
				<Button
					variant='ghost'
					size='custom'
					className={cn(
						'px-4 py-2 rounded-lg text-white hover:bg-indigo-600',
						boardSize === 5 && 'bg-indigo-600',
						boardSize !== 5 && 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
					)}
					onClick={() => setBoardSize(5)}
				>
					5x5
				</Button>
				<Button
					variant='ghost'
					size='custom'
					className={cn(
						'px-4 py-2 rounded-lg text-white hover:bg-indigo-600',
						boardSize === 10 && 'bg-indigo-600',
						boardSize !== 10 && 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
					)}
					onClick={() => setBoardSize(10)}
				>
					10x10
				</Button>
			</div>

			<div className='space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full'>
				<div className='p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md text-center'>
					<Computer className='mx-auto text-emerald-600 dark:text-emerald-400 mb-2' size={32} />
					<h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Play vs AI</h3>
					<p className='text-slate-500 dark:text-slate-400'>
						Challenge our AI in different difficulties.
					</p>
					<Button
						className='mt-4'
						variant='primaryDark'
						size='lg'
						onClick={() => startGame('ai')}
					>
						Start Game
					</Button>
				</div>

				<div className='p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md text-center'>
					<Gamepad2 className='mx-auto text-sky-600 dark:text-sky-400 mb-2' size={32} />
					<h3 className='text-xl font-semibold text-slate-900 dark:text-white'>Online Game</h3>
					<p className='text-slate-500 dark:text-slate-400'>Play against real players online!</p>
					<Button
						className='mt-4 bg-sky-600 text-white hover:bg-sky-700'
						variant='ghost'
						size='lg'
						onClick={() => startGame('online')}
					>
						Find Opponent
					</Button>
				</div>

				<div className='p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md text-center sm:col-span-2'>
					<Gamepad2 className='mx-auto text-violet-600 dark:text-violet-400 mb-2' size={32} />
					<h3 className='text-xl font-semibold text-slate-900 dark:text-white'>
						1v1v1v1 Mode
					</h3>
					<p className='text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5'>
						New shapes:
						<X className='w-4 h-4 text-rose-500 inline' />
						<Circle className='w-4 h-4 text-sky-500 inline' />
						<Square className='w-4 h-4 text-violet-500 inline' />
						<Triangle className='w-4 h-4 text-amber-500 inline' />
					</p>
					<Button
						className='mt-4 bg-violet-600 text-white hover:bg-violet-700'
						variant='ghost'
						size='lg'
						onClick={() => startGame('1v1v1v1')}
					>
						Start 4 players
					</Button>
				</div>
			</div>
		</div>
	)
}
