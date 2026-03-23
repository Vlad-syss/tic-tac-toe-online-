export const GameBoardSkeleton = ({ size = 3 }: { size?: number }) => {
	const cellSize = size > 5 ? 'minmax(40px, 80px)' : 'minmax(60px, 120px)'

	return (
		<div className='p-4 mb-4 border-b border-slate-200 dark:border-slate-800'>
			<div
				className='grid gap-1 py-2 justify-center w-full max-w-[1000px] mx-auto rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 shadow-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700'
				style={{
					gridTemplateColumns: `repeat(${size}, ${cellSize})`,
					gridTemplateRows: `repeat(${size}, ${cellSize})`,
				}}
			>
				{Array.from({ length: size * size }).map((_, i) => (
					<div
						key={i}
						className='w-full h-full flex items-center justify-center border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/80 rounded-md'
					>
						<div className='w-10 h-10 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded-full' />
					</div>
				))}
			</div>
		</div>
	)
}
