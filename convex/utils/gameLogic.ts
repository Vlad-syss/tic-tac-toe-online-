type CellSymbol = 'X' | 'O' | 'Square' | 'Triangle' | ''

type BoardCell = {
	symbol: CellSymbol
	row: number
	col: number
}

export const checkWinCondition = (
	board: BoardCell[][],
	symbol: CellSymbol,
	fieldSize: number
): boolean => {
	for (let i = 0; i < fieldSize; i++) {
		if (board[i].every(cell => cell.symbol === symbol)) return true
	}

	for (let j = 0; j < fieldSize; j++) {
		if (board.every(row => row[j].symbol === symbol)) return true
	}

	if (board.every((row, i) => row[i].symbol === symbol)) return true
	if (board.every((row, i) => row[fieldSize - 1 - i].symbol === symbol))
		return true

	return false
}

export const isBoardFull = (board: BoardCell[][]): boolean => {
	return board.every(row => row.every(cell => cell.symbol !== ''))
}
