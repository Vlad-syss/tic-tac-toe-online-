import { describe, expect, it, vi } from 'vitest'
import { checkWinner, handleCellClick } from '../gameUtils'
import { GameState } from '@/entities/game'
import { Id } from '../../../../convex/_generated/dataModel'

const makeGameState = (overrides: Partial<GameState> = {}): GameState => ({
	board: [[{ row: 0, col: 0, symbol: '' }]],
	userIds: ['user1' as Id<'users'>, 'user2' as Id<'users'>],
	currentPlayerIndex: 0,
	currentTurn: 'user1' as Id<'users'>,
	gameMode: 'Online',
	gameStatus: 'in_progress',
	winner: null,
	isDraw: false,
	createdAt: '',
	updatedAt: '',
	fieldSize: 3,
	players: [{ user: { _id: 'user1' as Id<'users'> } }, { user: { _id: 'user2' as Id<'users'> } }],
	userSymbols: { user1: 'X', user2: 'O' },
	eliminatedPlayers: [],
	...overrides,
})

describe('checkWinner', () => {
	it('returns null for null gameState', () => {
		expect(checkWinner(null)).toBeNull()
	})

	it('returns null for in-progress game', () => {
		expect(checkWinner(makeGameState())).toBeNull()
	})

	it('returns Draw for draw game', () => {
		expect(
			checkWinner(makeGameState({ gameStatus: 'completed', isDraw: true }))
		).toBe('Draw')
	})

	it('returns You when first player wins', () => {
		expect(
			checkWinner(
				makeGameState({
					gameStatus: 'completed',
					winner: 'user1' as Id<'users'>,
				})
			)
		).toBe('You')
	})

	it('returns Opponent when second player wins', () => {
		expect(
			checkWinner(
				makeGameState({
					gameStatus: 'completed',
					winner: 'user2' as Id<'users'>,
				})
			)
		).toBe('Opponent')
	})
})

describe('handleCellClick', () => {
	it('calls makeMove with correct args', () => {
		const makeMove = vi.fn()
		const gameId = 'game1' as Id<'games'>
		handleCellClick(makeGameState(), gameId, makeMove, 0, 0)
		expect(makeMove).toHaveBeenCalledWith({ gameId, row: 0, col: 0 })
	})

	it('does nothing when gameState is null', () => {
		const makeMove = vi.fn()
		handleCellClick(null, 'game1' as Id<'games'>, makeMove, 0, 0)
		expect(makeMove).not.toHaveBeenCalled()
	})

	it('does nothing when game is completed', () => {
		const makeMove = vi.fn()
		handleCellClick(
			makeGameState({ gameStatus: 'completed' }),
			'game1' as Id<'games'>,
			makeMove,
			0,
			0
		)
		expect(makeMove).not.toHaveBeenCalled()
	})

	it('does nothing in AI mode when not player turn', () => {
		const makeMove = vi.fn()
		handleCellClick(
			makeGameState({ gameMode: 'AI', currentPlayerIndex: 1 }),
			'game1' as Id<'games'>,
			makeMove,
			0,
			0
		)
		expect(makeMove).not.toHaveBeenCalled()
	})

	it('does nothing in online mode when not current user turn', () => {
		const makeMove = vi.fn()
		handleCellClick(
			makeGameState({ currentTurn: 'user2' as Id<'users'> }),
			'game1' as Id<'games'>,
			makeMove,
			0,
			0,
			'user1' as Id<'users'>
		)
		expect(makeMove).not.toHaveBeenCalled()
	})
})
