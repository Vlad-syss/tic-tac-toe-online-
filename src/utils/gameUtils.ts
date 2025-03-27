import { FunctionReturnType } from 'convex/server'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Cell, GameState, Move, SymbolType } from '../types'

export const createGameState = (
	getGame:
		| FunctionReturnType<typeof api.games.games_controller.getGame>
		| undefined
): GameState | null => {
	if (!getGame) return null

	const board2D: Cell[][] = getGame.board.map(row =>
		row.map(cell => ({
			row: cell.row,
			col: cell.col,
			symbol: cell.symbol as SymbolType | '',
		}))
	)

	const currentPlayerIndex =
		getGame.board.flat().filter(cell => cell.symbol !== '').length % 2

	return {
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
	}
}

export const handleCellClick = (
	gameState: GameState | null,
	gameId: Id<'games'> | null,
	makeMove: (move: Move) => void,
	row: number,
	col: number
) => {
	if (
		gameState?.gameStatus !== 'in_progress' ||
		gameState?.currentPlayerIndex !== 0 ||
		!gameId
	) {
		return
	}
	// const playerId = gameState.userIds[gameState.currentPlayerIndex]
	// if (!playerId) return
	const symbol: SymbolType = gameState.currentPlayerIndex === 0 ? 'X' : 'O'
	const moveObject = {
		gameId,
		row,
		col,
		symbol,
	}
	console.log('Move object before makeMoves:', moveObject)
	makeMove(moveObject)
}

export const checkWinner = (gameState: GameState | null) => {
	if (!gameState) return null
	if (gameState.gameStatus === 'completed') {
		if (gameState.isDraw) return 'Draw'
		if (gameState.winner) {
			const winnerIndex = gameState.userIds.findIndex(
				userId => userId === gameState.winner
			)
			return winnerIndex === 0 ? 'You' : 'Opponent'
		}
	}
	return null
}
