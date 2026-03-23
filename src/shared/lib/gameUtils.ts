import { FunctionReturnType } from 'convex/server'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { Cell, EliminatedPlayer, GameState, Move, SymbolType } from '@/entities/game'

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

	const eliminatedPlayers: EliminatedPlayer[] = (getGame.eliminatedPlayers ?? []).map(ep => ({
		userId: ep.userId,
		position: ep.position,
		eloChange: ep.eloChange,
	}))

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
		eliminatedPlayers,
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
	if (gameState.gameStatus !== 'in_progress') {
		return
	}

	if (gameState.gameMode === 'AI' && gameState.currentPlayerIndex !== 0) {
		return
	}

	if (
		gameState.gameMode !== 'AI' &&
		currentUserId &&
		gameState.currentTurn !== currentUserId
	) {
		return
	}

	if (
		currentUserId &&
		gameState.eliminatedPlayers.some(ep => ep.userId === currentUserId)
	) {
		return
	}

	makeMove({ gameId, row, col })
}

export const checkWinner = (gameState: GameState | null, currentUserId?: Id<'users'> | null) => {
	if (!gameState) return null
	if (gameState.gameStatus === 'completed') {
		if (gameState.isDraw) return 'Draw'
		if (gameState.gameMode === '1v1v1v1' && gameState.eliminatedPlayers.length > 0) {
			const first = gameState.eliminatedPlayers.find(ep => ep.position === 1)
			if (first && first.userId === currentUserId) return 'You'
			return 'Opponent'
		}
		if (gameState.winner) {
			if (currentUserId) {
				return gameState.winner === currentUserId ? 'You' : 'Opponent'
			}
			const winnerIndex = gameState.userIds.findIndex(
				userId => userId === gameState.winner
			)
			return winnerIndex === 0 ? 'You' : 'Opponent'
		}
	}
	return null
}
