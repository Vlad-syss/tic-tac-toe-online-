const K = 32

export function calculateElo(
	winnerRating: number,
	loserRating: number
): { newWinnerRating: number; newLoserRating: number } {
	const expectedWinner =
		1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400))
	const expectedLoser =
		1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400))

	const newWinnerRating = Math.round(winnerRating + K * (1 - expectedWinner))
	const newLoserRating = Math.round(loserRating + K * (0 - expectedLoser))

	return { newWinnerRating, newLoserRating }
}

export function calculateEloDraw(
	rating1: number,
	rating2: number
): { newRating1: number; newRating2: number } {
	const expected1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400))
	const expected2 = 1 / (1 + Math.pow(10, (rating1 - rating2) / 400))

	const newRating1 = Math.round(rating1 + K * (0.5 - expected1))
	const newRating2 = Math.round(rating2 + K * (0.5 - expected2))

	return { newRating1, newRating2 }
}
