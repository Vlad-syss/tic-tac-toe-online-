export const LeaderboardSkeleton = () => (
	<div className='flex flex-col gap-2 p-4 w-full'>
		<div className='w-48 h-8 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded mb-2' />
		{Array.from({ length: 10 }).map((_, i) => (
			<div key={i} className='flex items-center gap-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/40'>
				<div className='w-8 h-8 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded-full' />
				<div className='w-10 h-10 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
				<div className='flex-1 flex flex-col gap-1'>
					<div className='w-32 h-4 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
					<div className='w-20 h-3 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
				</div>
				<div className='w-16 h-5 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
			</div>
		))}
	</div>
)
