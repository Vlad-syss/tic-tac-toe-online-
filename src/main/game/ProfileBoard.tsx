import cn from 'classnames'
import { FC, useEffect, useState } from 'react'
import { Id } from '../../../convex/_generated/dataModel'
import { Profile } from '../../components/Profile'
import { SymbolType } from '../../types'

interface ProfileBoardProps {
	userIds: Id<'users'>[]
	isAi: boolean
	userSymbols: Record<string, SymbolType>
	timeLeft: number | undefined
	currentPlayerIndex: number
}

export const ProfileBoard: FC<ProfileBoardProps> = ({
	userIds,
	isAi,
	userSymbols,
	timeLeft,
	currentPlayerIndex,
}) => {
	const [playerTimers, setPlayerTimers] = useState<Record<number, string>>({})

	useEffect(() => {
		// Initialize timers for all players when the component mounts
		const initialTimers: Record<number, string> = {}
		userIds.forEach((_, index) => {
			initialTimers[index] = '01:00' // Initialize all timers to 01:00
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

	return (
		<div className='pb-3 mb-3 border-b-2'>
			<div className='flex relative justify-between bg-green-300/70 p-4 px-5 rounded-lg shadow-md border border-green-500'>
				{userIds.map((userId, i) => {
					const isReverse = (i + 1) % 2 === 0
					const userSymbol = userSymbols ? userSymbols[userId] : null

					return (
						<div
							key={userId}
							className={cn(
								'flex items-center gap-2',
								isReverse ? 'flex-row' : 'flex-row-reverse'
							)}
						>
							<div className='flex flex-col items-center justify-center w-24 h-12 pt-2 pb-1 border-2 border-emerald-400 rounded-lg shadow-lime-200/40 text-lg font-semibold text-green-700 select-none'>
								<h3 className='text-xs text-gray-600 mr-2'>⏳ Timer:</h3>
								<span className='text-green-700 font-bold text'>
									{playerTimers[i]}
								</span>
							</div>
							<div className='text-3xl text-emerald-800 select-none'>|</div>
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
