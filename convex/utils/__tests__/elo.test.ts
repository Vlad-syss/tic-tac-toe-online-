import { describe, expect, it } from 'vitest'
import { calculateElo, calculateEloDraw } from '../elo'

describe('calculateElo', () => {
	it('winner gains and loser loses points', () => {
		const { newWinnerRating, newLoserRating } = calculateElo(1000, 1000)
		expect(newWinnerRating).toBeGreaterThan(1000)
		expect(newLoserRating).toBeLessThan(1000)
	})

	it('equal ratings result in symmetric changes', () => {
		const { newWinnerRating, newLoserRating } = calculateElo(1000, 1000)
		const winnerGain = newWinnerRating - 1000
		const loserLoss = 1000 - newLoserRating
		expect(winnerGain).toBe(loserLoss)
	})

	it('underdog wins more points than favorite', () => {
		const underdog = calculateElo(800, 1200)
		const favorite = calculateElo(1200, 800)
		const underdogGain = underdog.newWinnerRating - 800
		const favoriteGain = favorite.newWinnerRating - 1200
		expect(underdogGain).toBeGreaterThan(favoriteGain)
	})

	it('returns integer ratings', () => {
		const { newWinnerRating, newLoserRating } = calculateElo(1234, 1567)
		expect(Number.isInteger(newWinnerRating)).toBe(true)
		expect(Number.isInteger(newLoserRating)).toBe(true)
	})
})

describe('calculateEloDraw', () => {
	it('equal ratings stay the same on draw', () => {
		const { newRating1, newRating2 } = calculateEloDraw(1000, 1000)
		expect(newRating1).toBe(1000)
		expect(newRating2).toBe(1000)
	})

	it('higher rated player loses points on draw', () => {
		const { newRating1, newRating2 } = calculateEloDraw(1200, 800)
		expect(newRating1).toBeLessThan(1200)
		expect(newRating2).toBeGreaterThan(800)
	})

	it('lower rated player gains points on draw', () => {
		const { newRating1, newRating2 } = calculateEloDraw(800, 1200)
		expect(newRating1).toBeGreaterThan(800)
		expect(newRating2).toBeLessThan(1200)
	})

	it('returns integer ratings', () => {
		const { newRating1, newRating2 } = calculateEloDraw(1111, 999)
		expect(Number.isInteger(newRating1)).toBe(true)
		expect(Number.isInteger(newRating2)).toBe(true)
	})
})
