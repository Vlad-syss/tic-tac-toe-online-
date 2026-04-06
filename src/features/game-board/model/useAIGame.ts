import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useGameApi } from './useGameApi'
import { Id } from '../../../../convex/_generated/dataModel'
import { checkWinner, createGameState, handleCellClick } from '@/shared/lib/gameUtils'
import { useUser } from '@/features/auth'

const TURN_SECONDS = 60

export const useAIGame = (gameId: Id<'games'> | null, fieldSize: number) => {
	const { startGameWithAI, makeMoves, getGame, skipMove } = useGameApi(gameId)
	const { user } = useUser()

	const gameState = useMemo(() => createGameState(getGame), [getGame])

	const [isCreatingGame, setIsCreatingGame] = useState(false)
	const [timeLeft, setTimeLeft] = useState(TURN_SECONDS)

	const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
	const skipCalledRef = useRef(false)

	useEffect(() => {
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current)
			timerIntervalRef.current = null
		}

		if (!gameState || gameState.gameStatus !== 'in_progress') return

		skipCalledRef.current = false

		const turnStart = gameState.moveMadeAt
			? new Date(gameState.moveMadeAt).getTime()
			: Date.now()

		const calcRemaining = () => {
			const elapsed = Math.floor((Date.now() - turnStart) / 1000)
			return Math.max(0, TURN_SECONDS - elapsed)
		}

		setTimeLeft(calcRemaining())

		// Only count down when it's the human player's turn
		if (gameState.currentPlayerIndex !== 0) return

		timerIntervalRef.current = setInterval(() => {
			const remaining = calcRemaining()
			setTimeLeft(remaining)

			if (remaining <= 0) {
				clearInterval(timerIntervalRef.current!)
				timerIntervalRef.current = null

				if (!skipCalledRef.current && gameId) {
					skipCalledRef.current = true
					toast.error('Time ran out! Turn skipped.', {
						style: { background: '#f44336', color: '#fff' },
					})
					skipMove(gameId)
				}
			}
		}, 500)

		return () => {
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current)
				timerIntervalRef.current = null
			}
		}
	}, [gameState?.currentTurn, gameState?.gameStatus, gameState?.moveMadeAt])

	const startGame = useCallback(
		async (userId: Id<'users'>) => {
			setIsCreatingGame(true)
			try {
				const newGame = await startGameWithAI(userId, fieldSize)
				if (newGame?._id) {
					toast.success('Game started!', { style: { background: '#4CAF50', color: '#fff' } })
					return newGame._id
				}
				toast.error('Failed to start game.', { style: { background: '#f44336', color: '#fff' } })
				return null
			} catch {
				toast.error('Failed to start game.', { style: { background: '#f44336', color: '#fff' } })
				return null
			} finally {
				setIsCreatingGame(false)
			}
		},
		[startGameWithAI, fieldSize]
	)

	const handleCellClickWrapper = (row: number, col: number) => {
		handleCellClick(gameState, gameId, makeMoves, row, col)
	}

	return {
		gameState,
		isLoading: getGame === undefined || isCreatingGame,
		startGame,
		handleCellClick: handleCellClickWrapper,
		checkWinner: () => checkWinner(gameState, user?._id as Id<'users'> | null),
		timeLeft,
	}
}
