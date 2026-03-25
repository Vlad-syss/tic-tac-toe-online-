export const ProfileBoardSkeleton = ({ playerCount = 2 }: { playerCount?: number }) => (
	<div className='pb-3 mb-3 border-b border-slate-200 dark:border-slate-800'>
		<div className='flex relative justify-between bg-slate-200 dark:bg-slate-800/70 p-4 px-5 rounded-lg shadow-md border border-slate-200 dark:border-slate-700'>
			{Array.from({ length: playerCount }).map((_, i) => (
				<div key={i} className='flex items-center gap-2'>
					<div className='flex flex-col items-center justify-center w-24 h-12 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded-lg' />
					<div className='text-3xl text-slate-300 dark:text-slate-600 select-none'>|</div>
					<div className='flex gap-2'>
						<div className='w-[50px] h-[50px] animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
						<div className='flex flex-col gap-1'>
							<div className='w-20 h-4 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
							<div className='w-16 h-3 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
						</div>
					</div>
				</div>
			))}
		</div>
	</div>
)
