import { useCallback, useEffect, useState } from 'react'
import { useGameApi } from '.'
import { Id } from '../../convex/_generated/dataModel'
import { GameState } from '../types'
import {
	checkWinner,
	createGameState,
	handleCellClick,
} from '../utils/gameUtils'

export const useOnlineGame = (
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

	useEffect(() => {
		setGameState(createGameState(getGame))
	}, [getGame])

	const startGameHandler = useCallback(() => {
		// Logic for starting an online game (e.g., creating a room, inviting players)
		startNewGame({}) // Placeholder for actual logic
	}, [startNewGame])

	// Logic for handling player connection and real time updates should be inside this hook.

	return {
		gameState,
		isLoading: getGame === undefined || mutationLoading,
		startGame: startGameHandler,
		handleCellClick: (row: number, col: number) =>
			handleCellClick(gameState, gameId, makeMoves, row, col),
		checkWinner: () => checkWinner(gameState),
	}
}
