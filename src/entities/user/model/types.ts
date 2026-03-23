import { Id } from '../../../../convex/_generated/dataModel'

export interface UserType {
	_id: Id<'users'>
	name: string
	email?: string
	onlineRating: number
	offlineRating: number
	totalGamesPlayed: number
	highestWinStreak: number
	currentWinStreak?: number
	avatarUrl?: string
	totalWins: number
	_creationTime: number
}
