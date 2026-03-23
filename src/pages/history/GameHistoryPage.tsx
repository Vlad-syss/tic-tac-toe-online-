import { usePaginatedQuery } from 'convex/react'
import { Clock, Grid3X3, Loader, Minus, Trophy, X as XIcon } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { api } from '../../../convex/_generated/api'
import { useUser } from '@/features/auth'
import { Id } from '../../../convex/_generated/dataModel'

const PAGE_SIZE = 10

export function GameHistoryPage() {
	const { user, isLoading: userLoading } = useUser()
	const { results: games, status, loadMore } = usePaginatedQuery(
		api.games.games_controller.getCompletedGamesForUser,
		user?._id ? { userId: user._id as Id<'users'> } : 'skip',
		{ initialNumItems: PAGE_SIZE }
	)

	const loaderRef = useRef<HTMLDivElement>(null)

	const handleLoadMore = useCallback(() => {
		if (status === 'CanLoadMore') {
			loadMore(PAGE_SIZE)
		}
	}, [status, loadMore])

	useEffect(() => {
		const el = loaderRef.current
		if (!el) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					handleLoadMore()
				}
			},
			{ threshold: 0.5 }
		)

		observer.observe(el)
		return () => observer.disconnect()
	}, [handleLoadMore])

	if (userLoading || status === 'LoadingFirstPage') {
		return (
			<div className='flex flex-col gap-3 p-6 w-full'>
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className='animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded-lg h-20 w-full' />
				))}
			</div>
		)
	}

	if (!games || games.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center p-12 text-slate-500 dark:text-slate-400'>
				<Trophy className='w-16 h-16 mb-4 opacity-40' />
				<h2 className='text-2xl font-bold mb-2'>No Games Yet</h2>
				<p className='text-slate-400 dark:text-slate-500'>Complete some games to see your history here!</p>
			</div>
		)
	}

	return (
		<div className='flex flex-col gap-4 p-6 w-full'>
			<h2 className='text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2'>Game History</h2>
			<div className='flex flex-col gap-3'>
				{games.map(game => {
					const isWin = game.winnerId === user?._id
					const isDraw = game.isDraw
					const opponents = game.userIds
						.filter((id: Id<'users'>) => id !== user?._id)
						.map((id: Id<'users'>) => game.users[id]?.name || 'Unknown')

					return (
						<div
							key={game._id}
							className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-slate-800/60 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow'
						>
							<div className='flex-shrink-0'>
								{isDraw ? (
									<Minus className='w-8 h-8 text-amber-500' />
								) : isWin ? (
									<Trophy className='w-8 h-8 text-emerald-500' />
								) : (
									<XIcon className='w-8 h-8 text-rose-500' />
								)}
							</div>
							<div className='flex-1 min-w-0'>
								<div className='flex items-center gap-2 mb-1'>
									<span className={`font-bold text-lg ${isDraw ? 'text-amber-500' : isWin ? 'text-emerald-500' : 'text-rose-500'}`}>
										{isDraw ? 'Draw' : isWin ? 'Victory' : 'Defeat'}
									</span>
									<span className='text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 rounded'>
										{game.gameMode}
									</span>
								</div>
								<p className='text-sm text-slate-600 dark:text-slate-400 truncate'>
									vs {opponents.join(', ')}
								</p>
							</div>
							<div className='flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-slate-500 dark:text-slate-400'>
								<div className='flex items-center gap-1'>
									<Grid3X3 className='w-4 h-4' />
									<span>{game.fieldSize}x{game.fieldSize}</span>
								</div>
								<div className='flex items-center gap-1'>
									<Clock className='w-4 h-4' />
									<span>{new Date(game.createdAt).toLocaleDateString()}</span>
								</div>
							</div>
						</div>
					)
				})}
			</div>

			{status === 'CanLoadMore' && (
				<div ref={loaderRef} className='flex items-center justify-center py-6'>
					<Loader className='w-6 h-6 animate-spin text-indigo-500' />
				</div>
			)}

			{status === 'Exhausted' && games.length > PAGE_SIZE && (
				<p className='text-center text-sm text-slate-400 dark:text-slate-500 py-4'>
					No more games to load
				</p>
			)}
		</div>
	)
}
