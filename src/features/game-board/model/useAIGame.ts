import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useGameApi } from './useGameApi'
import { Id } from '../../../../convex/_generated/dataModel'
import { checkWinner, createGameState, handleCellClick } from '@/shared/lib/gameUtils'

const TURN_SECONDS = 60

export const useAIGame = (gameId: Id<'games'> | null, fieldSize: number) => {
	const { startGameWithAI, aiMove, makeMoves, getGame } = useGameApi(gameId)

	const gameState = useMemo(() => createGameState(getGame), [getGame])

	const [isCreatingGame, setIsCreatingGame] = useState(false)
	const [timeLeft, setTimeLeft] = useState(TURN_SECONDS)

	const gameStateRef = useRef(gameState)
	const gameIdRef = useRef(gameId)
	const aiMoveRef = useRef(false)
	const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
	const turnStartRef = useRef<number>(Date.now())

	gameStateRef.current = gameState
	gameIdRef.current = gameId

	useEffect(() => {
		if (!gameState || !gameId) return
		if (gameState.gameStatus !== 'in_progress') {
			aiMoveRef.current = false
			return
		}

		const aiUserId = gameState.userIds[1]
		if (!aiUserId) return

		if (gameState.currentTurn === aiUserId) {
			if (aiMoveRef.current) return
			aiMoveRef.current = true
			aiMove({ gameId, playerId: aiUserId }).catch(() => {
				toast.error('AI move failed')

				aiMoveRef.current = false
			})
		} else {
			aiMoveRef.current = false
		}
	}, [gameState?.currentTurn, gameState?.gameStatus, gameId])

	useEffect(() => {
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current)
			timerIntervalRef.current = null
		}

		if (!gameState || gameState.gameStatus !== 'in_progress') return

		if (gameState.currentPlayerIndex !== 0) {
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

				toast.error('Time ran out!', { style: { background: '#f44336', color: '#fff' } })
				const gs = gameStateRef.current
				const gid = gameIdRef.current
				if (gs && gid && !aiMoveRef.current) {
					const aiUserId = gs.userIds[1]
					if (aiUserId) {
						aiMoveRef.current = true
						aiMove({ gameId: gid, playerId: aiUserId }).catch(() => {
							aiMoveRef.current = false
						})
					}
				}
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
	}, [gameState?.currentTurn, gameState?.gameStatus])

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
		checkWinner: () => checkWinner(gameState),
		timeLeft,
	}
}
