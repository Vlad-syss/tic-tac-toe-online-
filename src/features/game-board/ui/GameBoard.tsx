import { Circle, Square, Triangle, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { FC, JSX } from 'react'
import { Cell } from '@/entities/game'
import { useSoundEffects } from '@/features/sound'

interface GameBoardProps {
	board: Cell[][]
	onClick: (row: number, col: number) => void
}

const SYMBOL_COMPONENTS: Record<string, JSX.Element> = {
	O: <Circle className='w-10 h-10 text-sky-500 drop-shadow-lg' />,
	Square: <Square className='w-10 h-10 text-violet-500 drop-shadow-lg' />,
	Triangle: <Triangle className='w-10 h-10 text-amber-500 drop-shadow-lg' />,
	X: <X className='w-10 h-10 text-rose-500 drop-shadow-lg' />,
}

export const GameBoard: FC<GameBoardProps> = ({ board, onClick }) => {
	const { playMove } = useSoundEffects()
	const gridSize = board.length
	const cellSize = gridSize > 5 ? 'minmax(40px, 80px)' : 'minmax(60px, 120px)'

	return (
		<div className='p-4 mb-4 border-b border-slate-200 dark:border-slate-800'>
			<div
				className='grid gap-1 py-2 justify-center w-full max-w-[1000px] mx-auto rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 shadow-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700'
				style={{
					gridTemplateColumns: `repeat(${gridSize}, ${cellSize})`,
					gridTemplateRows: `repeat(${gridSize}, ${cellSize})`,
				}}
			>
				{board.map((row, rowIndex) =>
					row.map((cell, colIndex) => (
						<motion.button
							key={`${rowIndex}-${colIndex}`}
							className='w-full h-full flex items-center justify-center border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/80 cursor-pointer text-4xl font-semibold rounded-md'
							onClick={() => {
								playMove()
								onClick(rowIndex, colIndex)
							}}
							whileHover={{ scale: 1.05, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
							whileTap={{ scale: 0.95 }}
							transition={{ duration: 0.15 }}
						>
							<AnimatePresence mode='wait'>
								{cell.symbol && (
									<motion.div
										key={cell.symbol}
										initial={{ scale: 0, rotate: -180 }}
										animate={{ scale: 1, rotate: 0 }}
										transition={{ type: 'spring', stiffness: 260, damping: 20 }}
									>
										{SYMBOL_COMPONENTS[cell.symbol]}
									</motion.div>
								)}
							</AnimatePresence>
						</motion.button>
					))
				)}
			</div>
		</div>
	)
}
