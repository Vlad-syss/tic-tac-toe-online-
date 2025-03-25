import { FC } from 'react'
import { Id } from '../../../convex/_generated/dataModel'
import { Profile } from '../../components/Profile'
import { SymbolType } from '../../types'

interface ProfileBoardProps {
	userIds: Id<'users'>[]
	isAi: boolean
	userSymbols: Record<string, SymbolType>
}
export const ProfileBoard: FC<ProfileBoardProps> = ({
	userIds,
	isAi,
	userSymbols,
}) => {
	return (
		<div className='pb-3 mb-3 border-b-2'>
			<div className='flex justify-between bg-green-300/70 p-2 px-3 rounded-lg'>
				{userIds.map((userId, i) => {
					const isReverse = (i + 1) % 2 === 0
					const userSymbol = userSymbols ? userSymbols[userId] : null

					return (
						<Profile
							key={userId}
							userId={userId}
							isGame={true}
							isAi={isAi}
							reverse={isReverse}
							userSymbol={userSymbol}
						/>
					)
				})}
			</div>
		</div>
	)
}
