import { useCallback, useEffect, useState } from 'react'
import { useGameApi } from '.'
import { Id } from '../../convex/_generated/dataModel'
import { GameState } from '../types'
import {
	checkWinner,
	createGameState,
	handleCellClick,
} from '../utils/gameUtils'

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

	useEffect(() => {
		setGameState(createGameState(getGame))
	}, [getGame])

	const startGameHandler = useCallback(() => {
		// Logic for starting a 2v2 game (e.g., team assignments, player coordination)
		startNewGame({}) // Placeholder for actual logic
	}, [startNewGame])

	// Logic for team coordination, and player real time updates should be inside this hook.

	return {
		gameState,
		isLoading: getGame === undefined || mutationLoading,
		startGame: startGameHandler,
		handleCellClick: (row: number, col: number) =>
			handleCellClick(gameState, gameId, makeMoves, row, col),
		checkWinner: () => checkWinner(gameState),
	}
}
