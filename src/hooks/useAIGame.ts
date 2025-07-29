import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useGameApi } from '.'
import { Id } from '../../convex/_generated/dataModel'
import { GameState } from '../types'
import {
	checkWinner,
	createGameState,
	handleCellClick,
} from '../utils/gameUtils'

export const useAIGame = (gameId: Id<'games'> | null, fieldSize: number) => {
	const {
		startGameWithAI,
		deleteAI,
		makeMoves,
		isLoading: mutationLoading,
		getGame,
	} = useGameApi(gameId)

	const [gameState, setGameState] = useState<GameState | null>(
		createGameState(getGame)
	)

	const [isCreatingGame, setIsCreatingGame] = useState(false)
	const [timeLeft, setTurnTimeLeft] = useState(60) // Player's remaining time
	const aiDeletedRef = useRef(false)
	const timerRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		setGameState(createGameState(getGame))
	}, [getGame])

	useEffect(() => {
		if (!gameState || gameState.gameStatus !== 'in_progress') return
		if (timerRef.current) clearInterval(timerRef.current)

		if (gameState.currentPlayerIndex === 0) {
			timerRef.current = setInterval(() => {
				setTurnTimeLeft(prev => {
					if (prev <= 1) {
						clearInterval(timerRef.current!)
						handleTimeoutMove()
						return 60 // Reset timer for the next turn
					}
					return prev - 1
				})
			}, 1000)
		}

		return () => {
			if (timerRef.current) clearInterval(timerRef.current)
		}
	}, [gameState?.currentPlayerIndex])

	const handleTimeoutMove = () => {
		if (!gameState || gameState.currentPlayerIndex !== 0 || !gameId) return

		toast.error('Time ran out! Skipping turn.', {
			style: { background: '#f44336', color: '#fff' },
		})
	}

	const startGame = useCallback(
		async (userId: Id<'users'>) => {
			setIsCreatingGame(true)
			try {
				const newGame = await startGameWithAI(userId, fieldSize)
				if (newGame && newGame._id) {
					toast.success('New game started!', {
						style: { background: '#4CAF50', color: '#fff' },
					})
					setTurnTimeLeft(60) // Reset timer for a new game
					return newGame._id
				} else {
					toast.error('Failed to start new game (game ID not found).', {
						style: { background: '#f44336', color: '#fff' },
					})
					return null
				}
			} catch (error) {
				console.error('Error starting new game:', error)
				toast.error('Failed to start new game.', {
					style: { background: '#f44336', color: '#fff' },
				})
				return null
			} finally {
				setIsCreatingGame(false)
			}
		},
		[startGameWithAI, fieldSize]
	)

	useEffect(() => {
		if (
			gameState &&
			gameState.gameStatus === 'completed' &&
			gameState.userIds[1] &&
			!aiDeletedRef.current // Check if AI has been deleted
		) {
			deleteAI({ aiUserId: gameState.userIds[1] })
			aiDeletedRef.current = true // Set the flag
		}
	}, [gameState?.gameStatus, gameState?.userIds, deleteAI])

	const handleCellClickWrapper = (row: number, col: number) => {
		handleCellClick(gameState, gameId, makeMoves, row, col)
		setTurnTimeLeft(60)
	}

	return {
		gameState,
		isLoading: getGame === undefined || mutationLoading || isCreatingGame,
		startGame,
		handleCellClick: handleCellClickWrapper,
		checkWinner: () => checkWinner(gameState),
		timeLeft,
	}
}
