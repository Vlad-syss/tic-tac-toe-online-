// GameBoard.tsx

import { Cell } from '../../types'

interface GameBoardProps {
	board: Cell[][] // 2D array of cells
	onClick: (row: number, col: number) => void
}

export const GameBoard = ({ board, onClick }: GameBoardProps) => {
	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: `repeat(${board.length}, 100px)`, // Dynamic grid columns
				gap: '5px',
			}}
		>
			{board.map((row, rowIndex) =>
				row.map((cell, colIndex) => (
					<button
						key={`${rowIndex}-${colIndex}`}
						style={{
							width: '100px',
							height: '100px',
							fontSize: '24px',
							background: 'lightgray',
						}}
						onClick={() => onClick(rowIndex, colIndex)} // Pass row and col
						className='cursor-pointer'
					>
						{cell.symbol}
					</button>
				))
			)}
		</div>
	)
}
