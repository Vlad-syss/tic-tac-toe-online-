export const ProfilePageSkeleton = () => (
	<div className='flex flex-col gap-6 w-full flex-[1_0_auto] max-w-6xl mx-auto'>
		<div className='w-full p-6 border-b-3 border-b-slate-200 dark:border-b-slate-700'>
			<div className='flex flex-row items-center'>
				<div className='w-[150px] h-[150px] rounded-full mr-6 animate-pulse bg-slate-200/60 dark:bg-slate-700/50' />
				<div className='flex gap-3'>
					<div className='flex flex-col gap-2'>
						<div className='w-32 h-6 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
						<div className='w-24 h-5 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
						<div className='w-40 h-4 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
					</div>
					<div className='flex flex-col gap-1'>
						<div className='w-28 h-4 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
						<div className='w-16 h-3 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded' />
					</div>
				</div>
			</div>
		</div>
		<div className='grid grid-cols-2 gap-4 p-4'>
			{Array.from({ length: 6 }).map((_, i) => (
				<div key={i} className='h-20 animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded-lg' />
			))}
		</div>
	</div>
)
