// GameBoard.tsx

import { Cell } from '../../types'

interface GameBoardProps {
	board: Cell[][] // 2D array of cells
	onClick: (row: number, col: number) => void
}

export const GameBoard = ({ board, onClick }: GameBoardProps) => {
	return (
		<div
			className={`grid gap-2`}
			style={{ gridTemplateColumns: `repeat(${board.length}, 120px)` }}
		>
			{board.map((row, rowIndex) =>
				row.map((cell, colIndex) => (
					<button
						key={`${rowIndex}-${colIndex}`}
						className={`
                            w-[120px]
                            h-[120px]
                            text-4xl
                            bg-green-300
                            border-2
                            border-green-200
                            rounded-lg
                            cursor-pointer
                            flex
                            items-center
                            justify-center
                            ${cell.symbol === 'X' ? 'text-green-800' : 'text-green-900'}
                        `}
						onClick={() => onClick(rowIndex, colIndex)}
					>
						{cell.symbol}
					</button>
				))
			)}
		</div>
	)
}
