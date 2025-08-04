import cn from 'classnames'
import { FC } from 'react'
import { Id } from '../../../convex/_generated/dataModel'
import { Profile } from '../../components/Profile'
import { SymbolType } from '../../types'

interface ProfileBoardProps {
	userIds: Id<'users'>[]
	isAi: boolean
	userSymbols: Record<string, SymbolType>
	timeLeft: number | undefined
	currentPlayerIndex?: Id<'users'> | undefined
	aiTimeLeft?: number // Optional
}

export const ProfileBoard: FC<ProfileBoardProps> = ({
	userIds,
	isAi,
	userSymbols,
	timeLeft,
	currentPlayerIndex,
	aiTimeLeft,
}) => {
	const time = isAi && userIds[0] !== currentPlayerIndex ? aiTimeLeft : timeLeft
	console.log(aiTimeLeft)

	return (
		<div className='pb-3 mb-3 border-b-2'>
			<div className='flex relative justify-between bg-green-300/70 p-4 px-5 rounded-lg shadow-md border border-green-500'>
				<div className='flex flex-col absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 items-center justify-center w-30 h-14 pt-3 pb-2 border-2 border-emerald-400 rounded-lg shadow-lime-200/40 text-lg font-semibold text-green-700 select-none'>
					<h3 className='text-sm text-gray-600'>Timer:</h3>
					<span
						className={cn('text-2xl', {
							'text-green-700': (time ?? 0) > 10,
							'text-red-600': (time ?? 0) <= 10,
						})}
					>
						{time ?? '--'}
					</span>
				</div>
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
