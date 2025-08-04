import { FunctionReturnType } from 'convex/server'
import { NavigateFunction } from 'react-router'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Cell, GameState, Move, SymbolType, UserType } from '../types'

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

	const usersIds = getGame.userIds
	let currentPlayerIndex: number = -1

	if (getGame.currentTurn !== undefined) {
		currentPlayerIndex = usersIds.indexOf(getGame.currentTurn)
	}

	return {
		board: board2D,
		userIds: getGame.userIds,
		currentTurn: getGame.currentTurn,
		gameMode: getGame.gameMode,
		gameStatus: getGame.gameStatus,
		winner: getGame.winnerId,
		isDraw: getGame.isDraw,
		createdAt: getGame.createdAt,
		updatedAt: getGame.updatedAt,
		fieldSize: getGame.fieldSize,
		players: getGame.userIds.map(id => ({ user: { _id: id } })),
		userSymbols: getGame.userSymbols,
		moveMadeAt: getGame.moveMadeAt,
	}
}

export const handleCellClick = (
	gameState: GameState | null,
	gameId: Id<'games'> | null,
	makeMove: (move: Move) => void,
	row: number,
	col: number,
	userId?: Id<'users'>
) => {
	if (
		gameState?.gameStatus !== 'in_progress' ||
		gameState?.currentTurn !== userId ||
		!gameId
	) {
		return
	}
	// const playerId = gameState.userIds[gameState.currentPlayerIndex]
	// if (!playerId) return
	const symbol: SymbolType = gameState.currentTurn === userId ? 'X' : 'O'
	const moveObject = {
		gameId,
		row,
		col,
		symbol,
	}
	console.log('Move object before makeMoves:', moveObject)
	makeMove(moveObject)
}

export const checkWinner = (
	gameState: GameState | null,
	isAI: boolean
): 'Draw' | 'You' | 'Opponent' | 'Lost' | null => {
	if (!gameState) {
		return null
	}

	if (gameState.isDraw) {
		return 'Draw'
	}

	if (gameState.winner) {
		const winnerId = gameState.winner
		const playerOneId = gameState.userIds[0]

		if (winnerId === playerOneId) {
			return 'You'
		}
	}

	if (isAI && gameState.gameStatus === 'lost') {
		return 'Lost'
	}

	return null
}
type StartGameWithAI = (
	userId: Id<'users'>,
	boardSize: number
) => Promise<{ _id: string } | null>

export const startGame = async (
	mode: string,
	boardSize: number,
	startGameWithAI: StartGameWithAI,
	user: UserType | undefined, // or your specific User type
	navigate: NavigateFunction
) => {
	if (user === undefined) return
	if (mode === 'ai' || mode === 'AI') {
		const newGame = await startGameWithAI(user?._id, boardSize)

		if (newGame) {
			navigate(`/game/${mode}?size=${boardSize}&gameId=${newGame._id}`)
		}
	} else {
		navigate(`/game/${mode}?size=${boardSize}`)
	}
}
