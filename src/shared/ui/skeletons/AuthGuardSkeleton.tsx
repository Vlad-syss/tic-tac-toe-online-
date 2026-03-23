export const AuthGuardSkeleton = () => (
	<div className='max-w-7xl mx-auto px-4 w-full'>
		<header className='flex items-center py-2 justify-between border-b border-slate-200 dark:border-slate-800'>
			<div className='flex items-center gap-1'>
				<div className='w-[65px] h-[65px] animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
				<div className='w-40 h-6 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
			</div>
			<div className='flex gap-2 items-center'>
				<div className='w-[50px] h-[50px] animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
				<div className='flex flex-col gap-1'>
					<div className='w-20 h-4 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
					<div className='w-24 h-3 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
				</div>
			</div>
		</header>
		<div className='flex flex-col items-center gap-6 mt-8 p-8'>
			<div className='w-64 h-10 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
			<div className='w-48 h-6 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
			<div className='grid grid-cols-2 gap-4 w-full max-w-lg'>
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className='h-40 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded-lg' />
				))}
			</div>
		</div>
	</div>
)
