import { describe, expect, it } from 'vitest'
import { generateInviteCode } from '../inviteCode'

describe('generateInviteCode', () => {
	it('returns a string of length 6', () => {
		expect(generateInviteCode()).toHaveLength(6)
	})

	it('only contains alphanumeric characters', () => {
		const code = generateInviteCode()
		expect(code).toMatch(/^[A-Za-z0-9]{6}$/)
	})

	it('generates unique codes', () => {
		const codes = new Set(Array.from({ length: 100 }, () => generateInviteCode()))
		expect(codes.size).toBeGreaterThan(90)
	})
})
