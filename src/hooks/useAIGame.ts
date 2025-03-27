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
		aiMove,
		deleteAI,
		makeMoves,
		isLoading: mutationLoading,
		getGame,
	} = useGameApi(gameId)
	const [gameState, setGameState] = useState<GameState | null>(
		createGameState(getGame)
	)

	const [isCreatingGame, setIsCreatingGame] = useState(false)
	const aiMoveRef = useRef(false)
	const aiDeletedRef = useRef(false)

	useEffect(() => {
		setGameState(createGameState(getGame))
	}, [getGame])

	const startGame = useCallback(
		async (userId: Id<'users'>) => {
			setIsCreatingGame(true)
			try {
				const newGame = await startGameWithAI(userId, fieldSize)
				if (newGame && newGame._id) {
					toast.success('New game started!', {
						style: { background: '#4CAF50', color: '#fff' },
					})
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

	useEffect(() => {
		if (
			gameState &&
			gameState.currentPlayerIndex === 1 &&
			gameState.gameStatus === 'in_progress' &&
			gameId &&
			!aiMoveRef.current
		) {
			const aiUserId = gameState.userIds[1]
			if (!aiUserId) return
			aiMoveRef.current = true
			aiMove({ gameId: gameId, playerId: aiUserId })
		}
	}, [gameState, aiMove, gameId])

	return {
		gameState,
		isLoading: getGame === undefined || mutationLoading || isCreatingGame,
		startGame,
		handleCellClick: (row: number, col: number) =>
			handleCellClick(gameState, gameId, makeMoves, row, col),
		checkWinner: () => checkWinner(gameState),
	}
}
