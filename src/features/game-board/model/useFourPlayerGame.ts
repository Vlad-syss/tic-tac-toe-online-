import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useGameApi } from './useGameApi'
import { Id } from '../../../../convex/_generated/dataModel'
import { checkWinner, createGameState, handleCellClick } from '@/shared/lib/gameUtils'
import { useUser } from '@/features/auth'

const TURN_SECONDS = 60

export const useFourPlayerGame = (
	gameId: Id<'games'> | null,
	_fieldSize: number
) => {
	const { user } = useUser()
	const { makeMoves, getGame } = useGameApi(gameId)

	const gameState = useMemo(() => createGameState(getGame), [getGame])

	const [timeLeft, setTimeLeft] = useState(TURN_SECONDS)

	const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
	const turnStartRef = useRef<number>(Date.now())

	useEffect(() => {
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current)
			timerIntervalRef.current = null
		}

		if (!gameState || gameState.gameStatus !== 'in_progress' || !user) return

		const myId = user._id as Id<'users'>
		if (gameState.currentTurn !== myId) {
			setTimeLeft(TURN_SECONDS)
			return
		}

		turnStartRef.current = Date.now()
		setTimeLeft(TURN_SECONDS)

		timerIntervalRef.current = setInterval(() => {
			const elapsed = Math.floor((Date.now() - turnStartRef.current) / 1000)
			const remaining = TURN_SECONDS - elapsed

			if (remaining <= 0) {
				clearInterval(timerIntervalRef.current!)
				timerIntervalRef.current = null
				setTimeLeft(0)
				toast.error('Time ran out! Turn skipped.', {
					style: { background: '#f44336', color: '#fff' },
				})
				return
			}

			setTimeLeft(remaining)
		}, 500)

		return () => {
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current)
				timerIntervalRef.current = null
			}
		}
	}, [gameState?.currentTurn, gameState?.gameStatus, user?._id])

	const handleCellClickWrapper = (row: number, col: number) => {
		if (!gameState || !gameId) return
		handleCellClick(
			gameState,
			gameId,
			makeMoves,
			row,
			col,
			user?._id as Id<'users'> | null
		)
	}

	const startGameHandler = useCallback(() => {}, [])

	return {
		gameState,
		isLoading: getGame === undefined,
		startGame: startGameHandler,
		handleCellClick: handleCellClickWrapper,
		checkWinner: () => checkWinner(gameState, user?._id as Id<'users'> | null),
		timeLeft,
	}
}
