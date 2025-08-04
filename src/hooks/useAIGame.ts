import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useGameApi, useUser } from '.'
import { Id } from '../../convex/_generated/dataModel'
import { GameState } from '../types'
import {
	checkWinner,
	createGameState,
	handleCellClick,
} from '../utils/gameUtils'
import { useTurnTimer } from './useTurnTimer'

export const useAIGame = (gameId: Id<'games'> | null, fieldSize: number) => {
	const {
		startGameWithAI,
		deleteAI,
		makeMoves,
		isLoading: mutationLoading,
		getGame,
		skipMove,
	} = useGameApi(gameId)
	const { user } = useUser()

	const [gameState, setGameState] = useState<GameState | null>(
		createGameState(getGame)
	)

	const aiDeletedRef = useRef(false)

	useEffect(() => {
		setGameState(createGameState(getGame))
	}, [getGame])

	const handleTimeoutMove = useCallback(() => {
		if (!gameState || !gameId) return

		toast.error('Time ran out! Skipping your turn.', {
			style: { background: '#f44336', color: '#fff' },
		})

		// Call the new Convex mutation to skip the move
		skipMove({ gameId }).catch(error => {
			console.error('Failed to skip move:', error)
			toast.error('Failed to skip turn.', {
				style: { background: '#f44336', color: '#fff' },
			})
		})
	}, [gameId, gameState, skipMove])

	const handleAITimeout = useCallback(() => {
		if (!gameState || !gameId) return

		toast.success('AI took too long! Skipping its turn.', {
			style: { background: '#1976d2', color: '#fff' },
		})

		skipMove({ gameId }).catch(error => {
			console.error('Failed to skip AI move:', error)
			toast.error('Failed to skip AI turn.', {
				style: { background: '#f44336', color: '#fff' },
			})
		})
	}, [gameId, gameState, skipMove])

	const userTimeLeft = useTurnTimer({
		currentTurnId: gameState?.currentTurn,
		playerId: user?._id,
		moveMadeAt: gameState?.moveMadeAt,
		gameStatus: gameState?.gameStatus,
		onTimeout: handleTimeoutMove,
	})

	const aiPlayerId = gameState?.userIds?.find(id => id !== user?._id)
	console.log({ gameState, aiPlayerId })

	const aiTimeLeft = useTurnTimer({
		currentTurnId: gameState?.currentTurn,
		playerId: aiPlayerId,
		moveMadeAt: gameState?.moveMadeAt,
		gameStatus: gameState?.gameStatus,
		onTimeout: handleAITimeout,
	})

	useEffect(() => {
		if (
			gameState &&
			(gameState.gameStatus === 'completed' ||
				gameState.gameStatus === 'lost') &&
			gameState.userIds[1] &&
			!aiDeletedRef.current // Check if AI has been deleted
		) {
			deleteAI({ aiUserId: gameState.userIds[1] })
			aiDeletedRef.current = true // Set the flag
		}
	}, [gameState?.gameStatus, gameState?.userIds, deleteAI])

	const handleCellClickWrapper = (row: number, col: number) => {
		handleCellClick(gameState, gameId, makeMoves, row, col, user?._id)
	}

	return {
		gameState,
		isLoading: getGame === undefined || mutationLoading,
		handleCellClick: handleCellClickWrapper,
		checkWinner: () => checkWinner(gameState, true),
		timeLeft: userTimeLeft,
		aiTimeLeft,
		skipMove,
		startGameWithAI,
	}
}
