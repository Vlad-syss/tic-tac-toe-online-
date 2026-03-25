export const HeaderProfileSkeleton = () => (
	<div className='flex gap-2 items-center'>
		<div className='w-[50px] h-[50px] animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
		<div className='flex flex-col gap-1'>
			<div className='w-20 h-4 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
			<div className='w-24 h-3 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
			<div className='w-24 h-3 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
		</div>
	</div>
)
