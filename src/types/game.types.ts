import { Id } from '../../convex/_generated/dataModel'

export type GameUser = {
	_id: Id<'users'>
	name: string
}

export type SymbolType = 'X' | 'O' | 'Square' | 'Triangle'
export type GameMode = 'AI' | 'Online' | '2v2'
export type GameStatus = 'waiting' | 'in_progress' | 'completed' | 'canceled'

export interface Move {
	gameId: string
	playerId: string
	row: number
	col: number
	symbol: SymbolType
	createdAt: string
}

export interface Cell {
	row: number
	col: number
	symbol: SymbolType | null
}

export interface Player {
	user: {
		_id: Id<'users'>
	}
}

export interface GameState {
	board: Cell[][]
	userIds: Id<'users'>[]
	currentPlayerIndex: number
	gameMode: GameMode
	gameStatus: GameStatus
	winner?: Id<'users'> | null
	isDraw: boolean
	createdAt: string
	updatedAt: string
	fieldSize: number
	players: Player[] // Add this line
}

export interface TicTacToeGame {
	state: GameState
	makeMove: (move: Move) => void
	resetGame: () => void
	checkWinner: () => string | null
}
