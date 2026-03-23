import { describe, expect, it } from 'vitest'
import { checkWinCondition, createEmptyBoard, isBoardFull } from '../gameLogic'

describe('createEmptyBoard', () => {
	it('creates a 3x3 board', () => {
		const board = createEmptyBoard(3)
		expect(board).toHaveLength(3)
		expect(board[0]).toHaveLength(3)
	})

	it('creates a 5x5 board', () => {
		const board = createEmptyBoard(5)
		expect(board).toHaveLength(5)
		board.forEach(row => expect(row).toHaveLength(5))
	})

	it('all cells are empty with correct coordinates', () => {
		const board = createEmptyBoard(3)
		board.forEach((row, r) =>
			row.forEach((cell, c) => {
				expect(cell.symbol).toBe('')
				expect(cell.row).toBe(r)
				expect(cell.col).toBe(c)
			})
		)
	})
})

describe('checkWinCondition', () => {
	it('detects row win', () => {
		const board = createEmptyBoard(3)
		board[0]![0]!.symbol = 'X'
		board[0]![1]!.symbol = 'X'
		board[0]![2]!.symbol = 'X'
		expect(checkWinCondition(board, 'X', 3)).toBe(true)
	})

	it('detects column win', () => {
		const board = createEmptyBoard(3)
		board[0]![0]!.symbol = 'O'
		board[1]![0]!.symbol = 'O'
		board[2]![0]!.symbol = 'O'
		expect(checkWinCondition(board, 'O', 3)).toBe(true)
	})

	it('detects main diagonal win', () => {
		const board = createEmptyBoard(3)
		board[0]![0]!.symbol = 'X'
		board[1]![1]!.symbol = 'X'
		board[2]![2]!.symbol = 'X'
		expect(checkWinCondition(board, 'X', 3)).toBe(true)
	})

	it('detects anti-diagonal win', () => {
		const board = createEmptyBoard(3)
		board[0]![2]!.symbol = 'O'
		board[1]![1]!.symbol = 'O'
		board[2]![0]!.symbol = 'O'
		expect(checkWinCondition(board, 'O', 3)).toBe(true)
	})

	it('returns false when no win', () => {
		const board = createEmptyBoard(3)
		board[0]![0]!.symbol = 'X'
		board[0]![1]!.symbol = 'O'
		board[0]![2]!.symbol = 'X'
		expect(checkWinCondition(board, 'X', 3)).toBe(false)
	})

	it('returns false for wrong symbol', () => {
		const board = createEmptyBoard(3)
		board[0]![0]!.symbol = 'X'
		board[0]![1]!.symbol = 'X'
		board[0]![2]!.symbol = 'X'
		expect(checkWinCondition(board, 'O', 3)).toBe(false)
	})

	it('works with 5x5 board', () => {
		const board = createEmptyBoard(5)
		for (let i = 0; i < 5; i++) {
			board[i]![i]!.symbol = 'Square'
		}
		expect(checkWinCondition(board, 'Square', 5)).toBe(true)
	})
})

describe('isBoardFull', () => {
	it('returns false for empty board', () => {
		expect(isBoardFull(createEmptyBoard(3))).toBe(false)
	})

	it('returns false for partially filled board', () => {
		const board = createEmptyBoard(3)
		board[0]![0]!.symbol = 'X'
		board[0]![1]!.symbol = 'O'
		expect(isBoardFull(board)).toBe(false)
	})

	it('returns true for full board', () => {
		const board = createEmptyBoard(3)
		const symbols = ['X', 'O'] as const
		board.forEach(row =>
			row.forEach((cell, i) => {
				cell.symbol = symbols[i % 2]!
			})
		)
		expect(isBoardFull(board)).toBe(true)
	})
})
