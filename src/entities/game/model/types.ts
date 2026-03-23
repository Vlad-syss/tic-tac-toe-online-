import { Id } from '../../../../convex/_generated/dataModel'

export type GameUser = {
	_id: Id<'users'>
	name: string
}

export type SymbolType = 'X' | 'O' | 'Square' | 'Triangle'
export type GameMode = 'AI' | 'Online' | '1v1v1v1'
export type GameStatus =
	| 'waiting'
	| 'in_progress'
	| 'completed'
	| 'canceled'
	| 'lost'

export interface Move {
	gameId: Id<'games'>
	row: number
	col: number
}

export interface Cell {
	row: number
	col: number
	symbol: SymbolType | ''
}

export interface Player {
	user: {
		_id: Id<'users'>
	}
}

export interface EliminatedPlayer {
	userId: Id<'users'>
	position: number
	eloChange: number
}

export interface GameState {
	board: Cell[][]
	userIds: Id<'users'>[]
	currentPlayerIndex: number
	currentTurn?: Id<'users'> | null
	gameMode: GameMode
	gameStatus: GameStatus
	winner?: Id<'users'> | null
	isDraw: boolean
	createdAt: string
	updatedAt: string
	moveMadeAt?: string
	fieldSize: number
	players: Player[]
	userSymbols: Record<string, SymbolType>
	eliminatedPlayers: EliminatedPlayer[]
}

export interface TicTacToeGame {
	state: GameState
	makeMove: (move: Move) => void
	resetGame: () => void
	checkWinner: () => string | null
}
