import { Circle, Square, Triangle, X } from 'lucide-react'
import { FC, JSX } from 'react'
import { Cell } from '../../types'

interface GameBoardProps {
	board: Cell[][] // 2D array of cells
	onClick: (row: number, col: number) => void
}

const SYMBOL_COMPONENTS: Record<string, JSX.Element> = {
	O: <Circle className='w-10 h-10 text-blue-600 drop-shadow-lg' />,
	Square: <Square className='w-10 h-10 text-purple-500 drop-shadow-lg' />,
	Triangle: <Triangle className='w-10 h-10 text-orange-500 drop-shadow-lg' />,
	X: <X className='w-10 h-10 text-red-500 drop-shadow-lg' />,
}

export const GameBoard: FC<GameBoardProps> = ({ board, onClick }) => {
	const gridSize = board.length
	const cellSize = gridSize > 5 ? 'minmax(40px, 80px)' : 'minmax(60px, 120px)'

	return (
		<div className='p-4 mb-4 border-b-2'>
			<div
				className='grid gap-1  py-2 justify-center w-full max-w-[1000px] mx-auto rounded-xl overflow-hidden border border-gray-300 shadow-lg bg-gradient-to-br from-green-200 to-green-400'
				style={{
					gridTemplateColumns: `repeat(${gridSize}, ${cellSize})`,
					gridTemplateRows: `repeat(${gridSize}, ${cellSize})`,
				}}
			>
				{board.map((row, rowIndex) =>
					row.map((cell, colIndex) => (
						<button
							key={`${rowIndex}-${colIndex}`}
							className='
								w-full h-full flex items-center justify-center border border-gray-200 bg-white 
								cursor-pointer text-4xl font-semibold rounded-md transition-all duration-300
								hover:scale-105 hover:bg-green-300/10 active:scale-95
							'
							onClick={() => onClick(rowIndex, colIndex)}
						>
							{cell.symbol && SYMBOL_COMPONENTS[cell.symbol]}
						</button>
					))
				)}
			</div>
		</div>
	)
}
