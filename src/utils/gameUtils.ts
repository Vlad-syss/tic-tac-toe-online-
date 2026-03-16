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

	const currentTurn = getGame.currentTurn ?? null
	const currentPlayerIndex = currentTurn
		? getGame.userIds.indexOf(currentTurn)
		: 0

	return {
		board: board2D,
		userIds: getGame.userIds,
		currentPlayerIndex: currentPlayerIndex >= 0 ? currentPlayerIndex : 0,
		currentTurn,
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
	col: number,
	currentUserId?: Id<'users'> | null
) => {
	if (!gameState || !gameId) return
	if (
		gameState.gameStatus !== 'in_progress' &&
		gameState.gameStatus !== 'waiting'
	) {
		return
	}

	// For AI games, only allow moves when it's the human's turn (index 0)
	if (gameState.gameMode === 'AI' && gameState.currentPlayerIndex !== 0) {
		return
	}

	// For online/multiplayer games, check if it's the current user's turn
	if (
		gameState.gameMode !== 'AI' &&
		currentUserId &&
		gameState.currentTurn !== currentUserId
	) {
		return
	}

	// Symbol is derived server-side; just send row/col
	makeMove({ gameId, row, col })
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
