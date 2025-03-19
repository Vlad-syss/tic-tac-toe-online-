// GameBoard.tsx

import { Cell } from '../../types'

interface GameBoardProps {
	board: Cell[][] // 2D array of cells
	onClick: (row: number, col: number) => void
}

export const GameBoard = ({ board, onClick }: GameBoardProps) => {
	return (
		<div
			className='grid w-full h-full max-w-[1000px] max-h-[90vh] justify-center'
			style={{
				gridTemplateColumns: `repeat(${board.length}, minmax(30px, 120px))`, // Adjust min size dynamically
				gridTemplateRows: `repeat(${board.length}, minmax(30px, 120px))`,
			}}
		>
			{board.map((row, rowIndex) =>
				row.map((cell, colIndex) => (
					<button
						key={`${rowIndex}-${colIndex}`}
						className='
                            w-full h-full
                            max-w-[10vw]   // Scale based on viewport
                            text-4xl bg-green-300 border-2 border-green-900
                            cursor-pointer flex items-center justify-center
                            hover:bg-green-400 transition
                        '
						onClick={() => onClick(rowIndex, colIndex)}
					>
						{cell.symbol}
					</button>
				))
			)}
		</div>
	)
}
