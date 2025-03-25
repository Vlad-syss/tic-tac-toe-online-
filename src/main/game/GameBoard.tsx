// GameBoard.tsx

import { Circle, Square, Triangle, X } from 'lucide-react'
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
						{cell.symbol === 'O' && (
							<Circle className='w-9 h-9  text-blue-500' />
						)}
						{cell.symbol === 'Square' && (
							<Square className='w-9 h-9  text-purple-500' />
						)}
						{cell.symbol === 'Triangle' && (
							<Triangle className='w-9 h-9  text-orange-500' />
						)}
						{cell.symbol === 'X' && (
							<X className='w-9 h-9  rounded-full text-red-500' />
						)}
					</button>
				))
			)}
		</div>
	)
}
