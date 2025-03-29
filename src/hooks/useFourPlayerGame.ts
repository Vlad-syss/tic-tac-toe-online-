import { useCallback, useEffect, useState } from 'react'
import { useGameApi } from '.'
import { Id } from '../../convex/_generated/dataModel'
import { GameState } from '../types'
import {
	checkWinner,
	createGameState,
	handleCellClick,
} from '../utils/gameUtils'

import toast from 'react-hot-toast'
import { useTurnTimer } from './useTurnTimer'

export const useFourPlayerGame = (
	gameId: Id<'games'> | null,
	fieldSize: number
) => {
	const {
		startNewGame,
		makeMoves,
		isLoading: mutationLoading,
		getGame,
	} = useGameApi(gameId)
	const [gameState, setGameState] = useState<GameState | null>(
		createGameState(getGame)
	)
	const [localTurnEndTime, setLocalTurnEndTime] = useState<number | null>(null)

	useEffect(() => {
		setGameState(createGameState(getGame))
		// Reset local timer when game state changes
		setLocalTurnEndTime(null)
	}, [getGame])

	const startGameHandler = useCallback(() => {
		startNewGame({})
		setLocalTurnEndTime(Date.now() + 60 * 1000) // Start timer client side
	}, [startNewGame])

	const turnTimeLimit = 60 * 1000

	const timeLeft = useTurnTimer(localTurnEndTime || 0, () => {
		skipTurn()
	})

	const skipTurn = () => {
		if (!gameState) return

		toast.error('Time ran out! Skipping turn.', {
			style: { background: '#f44336', color: '#fff' },
		})

		// Client-side turn skip logic: Change current player and reset timer.
		if (gameState.userIds && gameState.userIds.length > 0) {
			const nextPlayerIndex =
				(gameState.currentPlayerIndex + 1) % gameState.userIds.length
			setGameState(prevGameState => {
				if (!prevGameState) return prevGameState
				return {
					...prevGameState,
					currentPlayerIndex: nextPlayerIndex,
				}
			})
			setLocalTurnEndTime(Date.now() + turnTimeLimit) // Reset timer client side
		}
	}

	const handleCellClickWrapper = (row: number, col: number) => {
		if (!gameState || !gameId) return
		handleCellClick(gameState, gameId, makeMoves, row, col)
		setLocalTurnEndTime(Date.now() + turnTimeLimit) // Reset timer client side
	}

	return {
		gameState,
		isLoading: getGame === undefined || mutationLoading,
		startGame: startGameHandler,
		handleCellClick: handleCellClickWrapper,
		checkWinner: () => checkWinner(gameState),
		timeLeft,
	}
}
