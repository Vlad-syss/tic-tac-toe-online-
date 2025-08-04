import { Id } from '../../convex/_generated/dataModel'

export interface UserType {
	_id: Id<'users'>
	_creationTime: number
	email?: string | undefined
	avatarUrl?: string | undefined
	isAI?: boolean | undefined
	name: string
	onlineRating: number
	offlineRating: number
	totalGamesPlayed: number
	highestWinStreak: number
	totalWins: number
}
