import { describe, expect, it } from 'vitest'
import { checkWinCondition, createEmptyBoard, getWinLength, isBoardFull } from '../gameLogic'

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

describe('getWinLength', () => {
	it('returns 3 for 3x3 board', () => {
		expect(getWinLength(3)).toBe(3)
	})

	it('returns 4 for 5x5 board', () => {
		expect(getWinLength(5)).toBe(4)
	})

	it('returns 6 for 10x10 board', () => {
		expect(getWinLength(10)).toBe(6)
	})
})

describe('checkWinCondition', () => {
	it('detects row win on 3x3', () => {
		const board = createEmptyBoard(3)
		board[0]![0]!.symbol = 'X'
		board[0]![1]!.symbol = 'X'
		board[0]![2]!.symbol = 'X'
		expect(checkWinCondition(board, 'X', 3)).toBe(true)
	})

	it('detects column win on 3x3', () => {
		const board = createEmptyBoard(3)
		board[0]![0]!.symbol = 'O'
		board[1]![0]!.symbol = 'O'
		board[2]![0]!.symbol = 'O'
		expect(checkWinCondition(board, 'O', 3)).toBe(true)
	})

	it('detects main diagonal win on 3x3', () => {
		const board = createEmptyBoard(3)
		board[0]![0]!.symbol = 'X'
		board[1]![1]!.symbol = 'X'
		board[2]![2]!.symbol = 'X'
		expect(checkWinCondition(board, 'X', 3)).toBe(true)
	})

	it('detects anti-diagonal win on 3x3', () => {
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

	it('detects 4-in-a-row win on 5x5 board', () => {
		const board = createEmptyBoard(5)
		board[0]![0]!.symbol = 'X'
		board[0]![1]!.symbol = 'X'
		board[0]![2]!.symbol = 'X'
		board[0]![3]!.symbol = 'X'
		expect(checkWinCondition(board, 'X', 5)).toBe(true)
	})

	it('does not require 5-in-a-row on 5x5 board', () => {
		const board = createEmptyBoard(5)
		board[0]![0]!.symbol = 'X'
		board[0]![1]!.symbol = 'X'
		board[0]![2]!.symbol = 'X'
		// only 3 in a row on 5x5 - should NOT win (need 4)
		expect(checkWinCondition(board, 'X', 5)).toBe(false)
	})

	it('detects diagonal 4-in-a-row on 5x5 board', () => {
		const board = createEmptyBoard(5)
		board[1]![1]!.symbol = 'Square'
		board[2]![2]!.symbol = 'Square'
		board[3]![3]!.symbol = 'Square'
		board[4]![4]!.symbol = 'Square'
		expect(checkWinCondition(board, 'Square', 5)).toBe(true)
	})

	it('detects 6-in-a-row win on 10x10 board', () => {
		const board = createEmptyBoard(10)
		for (let i = 0; i < 6; i++) {
			board[2]![i + 2]!.symbol = 'O'
		}
		expect(checkWinCondition(board, 'O', 10)).toBe(true)
	})

	it('does not win with 5-in-a-row on 10x10 board', () => {
		const board = createEmptyBoard(10)
		for (let i = 0; i < 5; i++) {
			board[2]![i]!.symbol = 'O'
		}
		expect(checkWinCondition(board, 'O', 10)).toBe(false)
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
