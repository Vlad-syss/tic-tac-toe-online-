import { useEffect, useState } from 'react'
import { useGameApi } from '.'
import { Id } from '../../convex/_generated/dataModel'
import { Cell, GameState, SymbolType } from '../types'

export const useGameBase = (gameId: Id<'games'> | null) => {
	const { getGame } = useGameApi(gameId)

	const [gameState, setGameState] = useState<GameState | null>(null)

	useEffect(() => {
		if (getGame) {
			const board2D: Cell[][] = getGame.board.map(row =>
				row.map(cell => ({
					row: cell.row,
					col: cell.col,
					symbol: cell.symbol as SymbolType | '',
				}))
			)

			const currentPlayerIndex =
				getGame.board.flat().filter(cell => cell.symbol !== '').length % 2

			setGameState({
				board: board2D,
				userIds: getGame.userIds,
				currentPlayerIndex,
				gameMode: getGame.gameMode,
				gameStatus: getGame.gameStatus,
				winner: getGame.winnerId,
				isDraw: getGame.isDraw,
				createdAt: getGame.createdAt,
				updatedAt: getGame.updatedAt,
				fieldSize: getGame.fieldSize,
				players: getGame.userIds.map(id => ({ user: { _id: id } })),
				userSymbols: getGame.userSymbols,
			})
		}
	}, [getGame])

	return { getGame, gameState, isLoading: getGame === undefined }
}
