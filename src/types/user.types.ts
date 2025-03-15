export interface UserType {
	_id: string
	name: string
	email?: string
	onlineRating: number
	offlineRating: number
	totalGamesPlayed: number
	highestWinStreak: number
	avatarUrl?: string
	totalWins: number
	_creationTime: string
}
