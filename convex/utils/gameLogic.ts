type CellSymbol = 'X' | 'O' | 'Square' | 'Triangle' | ''

type BoardCell = {
	symbol: CellSymbol
	row: number
	col: number
}

export const createEmptyBoard = (fieldSize: number): BoardCell[][] =>
	Array.from({ length: fieldSize }, (_, rowIndex) =>
		Array.from({ length: fieldSize }, (_, colIndex) => ({
			symbol: '' as CellSymbol,
			row: rowIndex,
			col: colIndex,
		}))
	)

export const getWinLength = (fieldSize: number): number => {
	if (fieldSize <= 3) return 3
	if (fieldSize <= 5) return 4
	return 6
}

export const checkWinCondition = (
	board: BoardCell[][],
	symbol: CellSymbol,
	fieldSize: number
): boolean => {
	const winLength = getWinLength(fieldSize)

	// Check rows
	for (let r = 0; r < fieldSize; r++) {
		for (let c = 0; c <= fieldSize - winLength; c++) {
			let count = 0
			for (let k = 0; k < winLength; k++) {
				if (board[r]?.[c + k]?.symbol === symbol) count++
			}
			if (count === winLength) return true
		}
	}

	// Check columns
	for (let c = 0; c < fieldSize; c++) {
		for (let r = 0; r <= fieldSize - winLength; r++) {
			let count = 0
			for (let k = 0; k < winLength; k++) {
				if (board[r + k]?.[c]?.symbol === symbol) count++
			}
			if (count === winLength) return true
		}
	}

	// Check main diagonals (top-left to bottom-right)
	for (let r = 0; r <= fieldSize - winLength; r++) {
		for (let c = 0; c <= fieldSize - winLength; c++) {
			let count = 0
			for (let k = 0; k < winLength; k++) {
				if (board[r + k]?.[c + k]?.symbol === symbol) count++
			}
			if (count === winLength) return true
		}
	}

	// Check anti-diagonals (top-right to bottom-left)
	for (let r = 0; r <= fieldSize - winLength; r++) {
		for (let c = winLength - 1; c < fieldSize; c++) {
			let count = 0
			for (let k = 0; k < winLength; k++) {
				if (board[r + k]?.[c - k]?.symbol === symbol) count++
			}
			if (count === winLength) return true
		}
	}

	return false
}

export const isBoardFull = (board: BoardCell[][]): boolean => {
	return board.every(row => row.every(cell => cell.symbol !== ''))
}
