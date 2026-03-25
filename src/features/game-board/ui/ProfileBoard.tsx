import { clsx as cn } from 'clsx'
import { FC, useEffect, useState } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import { Profile } from '@/shared/ui/Profile'
import { EliminatedPlayer, SymbolType } from '@/entities/game'

interface ProfileBoardProps {
	userIds: Id<'users'>[]
	isAi: boolean
	userSymbols: Record<string, SymbolType>
	timeLeft: number | undefined
	currentPlayerIndex: number
	eliminatedPlayers?: EliminatedPlayer[]
}

export const ProfileBoard: FC<ProfileBoardProps> = ({
	userIds,
	isAi,
	userSymbols,
	timeLeft,
	currentPlayerIndex,
	eliminatedPlayers = [],
}) => {
	const [playerTimers, setPlayerTimers] = useState<Record<number, string>>({})

	useEffect(() => {
		const initialTimers: Record<number, string> = {}
		userIds.forEach((_, index) => {
			initialTimers[index] = '01:00'
		})
		setPlayerTimers(initialTimers)
	}, [userIds])

	useEffect(() => {
		if (timeLeft !== undefined && !isAi) {
			setPlayerTimers(prevTimers => ({
				...prevTimers,
				[currentPlayerIndex]: formatTime(timeLeft),
			}))
		}
	}, [timeLeft, currentPlayerIndex, isAi])

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
	}

	const isFourPlayer = userIds.length === 4

	return (
		<div className='pb-2 sm:pb-3 mb-2 sm:mb-3 border-b border-slate-200 dark:border-slate-800'>
			<div className={cn(
				'relative bg-slate-100 dark:bg-slate-800/70 p-2 sm:p-4 px-3 sm:px-5 rounded-lg shadow-md border border-slate-200 dark:border-slate-700',
				isFourPlayer
					? 'grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-between sm:gap-0'
					: 'flex flex-col sm:flex-row justify-between gap-2 sm:gap-0'
			)}>
				{userIds.map((userId, i) => {
					const isReverse = !isFourPlayer && (i + 1) % 2 === 0
					const userSymbol = userSymbols ? userSymbols[userId] : null
					const elimination = eliminatedPlayers.find(ep => ep.userId === userId)

					return (
						<div
							key={userId}
							className={cn(
								'flex items-center gap-1.5 sm:gap-2 relative',
								isFourPlayer
									? 'flex-row justify-center'
									: isReverse ? 'flex-row' : 'flex-row-reverse',
								elimination && 'opacity-50'
							)}
						>
							{elimination && (
								<div className='absolute -top-2 left-1/2 -translate-x-1/2 z-10 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'>
									#{elimination.position}
								</div>
							)}
							<div className='flex flex-col items-center justify-center w-16 sm:w-24 h-10 sm:h-12 pt-1.5 sm:pt-2 pb-0.5 sm:pb-1 border-2 border-slate-300 dark:border-slate-600 rounded-lg shadow-slate-200/40 dark:shadow-slate-900/40 text-base sm:text-lg font-semibold text-slate-600 dark:text-slate-300 select-none'>
								<h3 className='text-[9px] sm:text-xs text-slate-500 mr-1 sm:mr-2'>⏳ Timer:</h3>
								<span className='text-xs sm:text-base text-slate-700 dark:text-slate-300 font-bold'>
									{elimination ? '--:--' : playerTimers[i]}
								</span>
							</div>
							<div className='text-xl sm:text-3xl text-slate-300 dark:text-slate-600 select-none'>|</div>
							<Profile
								userId={userId}
								isGame={true}
								isAi={isAi}
								reverse={isReverse}
								userSymbol={userSymbol}
							/>
						</div>
					)
				})}
			</div>
		</div>
	)
}
