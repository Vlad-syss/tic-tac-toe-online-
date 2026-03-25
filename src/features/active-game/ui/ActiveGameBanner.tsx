import { useMutation, useQuery } from 'convex/react'
import { useNavigate } from 'react-router'
import { Play, X } from 'lucide-react'
import { api } from '../../../../convex/_generated/api'
import { useUser } from '@/features/auth'
import { Button } from '@/shared/ui/Button'

export const ActiveGameBanner = () => {
	const { user } = useUser()
	const navigate = useNavigate()
	const updateGameStatus = useMutation(api.games.games_controller.updateGameStatus)

	const activeGame = useQuery(
		api.games.games_controller.getActiveGameForUser,
		user?._id ? { userId: user._id } : 'skip'
	)

	if (!activeGame) return null

	const modeMap: Record<string, string> = {
		AI: 'ai',
		Online: 'online',
		'1v1v1v1': '1v1v1v1',
	}

	const modePath = modeMap[activeGame.gameMode] ?? 'ai'
	const params = new URLSearchParams({
		size: String(activeGame.fieldSize),
		gameId: activeGame._id,
	})
	if (activeGame.inviteCode) {
		params.set('invite', activeGame.inviteCode)
	}

	const abandonGame = () => {
		updateGameStatus({
			gameId: activeGame._id,
			gameStatus: 'canceled',
		})
	}

	return (
		<div className='w-full max-w-3xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg sm:p-4 p-2 flex items-center justify-between gap-4'>
			<div>
				<p className='font-semibold text-amber-800 dark:text-amber-200 sm:text-lg text-xs'>
					You have an active game!
				</p>
				<p className='text-sm text-amber-600 dark:text-amber-400'>
					{activeGame.gameMode} &middot; {activeGame.fieldSize}x{activeGame.fieldSize}
				</p>
			</div>
			<div className='flex items-center gap-2'>
				<Button
					variant='ghost'
					size='custom'
					className='bg-amber-500 text-white hover:bg-amber-600 shrink-0 px-2 sm:px-3 sm:py-1 py-2 rounded'
					onClick={() => navigate(`/game/${modePath}?${params.toString()}`)}
				>
					<Play className='w-4 h-4 sm:mr-1' />
					<span className='hidden sm:inline'>Resume</span>
				</Button>
				<Button
					variant='ghost'
					size='custom'
					className='text-amber-600 hover:bg-amber-200 dark:text-amber-400 dark:hover:bg-amber-900/40 shrink-0'
					onClick={abandonGame}
					title='Abandon game'
				>
					<X className='w-4 h-4' />
				</Button>
			</div>
		</div>
	)
}
