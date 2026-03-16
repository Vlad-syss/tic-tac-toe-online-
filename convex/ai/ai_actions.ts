'use node'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { v } from 'convex/values'
import { api } from '../_generated/api'
import { action } from '../_generated/server'

if (!process.env.VITE_GEMINI_APIKEY) {
	console.error('Gemini API Key is missing!')
}
const client = new GoogleGenerativeAI(process.env.VITE_GEMINI_APIKEY as string)
const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' })

export const generateAIMove = action({
	args: {
		board: v.array(
			v.array(
				v.object({
					row: v.number(),
					col: v.number(),
					symbol: v.union(
						v.literal('X'),
						v.literal('O'),
						v.literal('Square'),
						v.literal('Triangle'),
						v.literal('')
					),
				})
			)
		),
		fieldSize: v.number(),
		gameId: v.id('games'),
		playerId: v.id('users'),
		aiSymbol: v.union(
			v.literal('X'),
			v.literal('O'),
			v.literal('Square'),
			v.literal('Triangle')
		),
	},
	handler: async (ctx, { board, fieldSize, gameId, playerId, aiSymbol }) => {
		try {
			const humanSymbol = aiSymbol === 'X' ? 'O' : 'X'

			const boardString = board
				.map(row => row.map(cell => cell.symbol || '.').join('|'))
				.join('\n')

			const prompt = `You are playing tic-tac-toe on a ${fieldSize}x${fieldSize} board.
You are '${aiSymbol}'. Your opponent is '${humanSymbol}'.
Empty cells are shown as '.'.

Board (0-indexed rows top-to-bottom, columns left-to-right):
${boardString}

Win condition: fill an entire row, column, or diagonal with your symbol.

Respond with ONLY valid JSON (no other text): {"row": number, "col": number}
Choose an empty cell ('.') and make the best strategic move for '${aiSymbol}'.`

			const result = await model.generateContent(prompt)
			const response = result.response.text()

			let move: { row: number; col: number } | null = null
			try {
				const jsonMatch = response.match(/\{\s*"row"\s*:\s*\d+\s*,\s*"col"\s*:\s*\d+\s*\}/)
				if (jsonMatch) {
					const parsed = JSON.parse(jsonMatch[0])
					if (
						typeof parsed.row === 'number' &&
						typeof parsed.col === 'number' &&
						parsed.row >= 0 && parsed.row < fieldSize &&
						parsed.col >= 0 && parsed.col < fieldSize &&
						board[parsed.row][parsed.col].symbol === ''
					) {
						move = parsed
					}
				}
			} catch (parseError) {
				console.error('Failed to parse AI response:', response, parseError)
			}

			// Fallback to random empty cell if AI returned invalid move
			if (!move) {
				const emptyCells: { row: number; col: number }[] = []
				for (let r = 0; r < fieldSize; r++) {
					for (let c = 0; c < fieldSize; c++) {
						if (board[r][c].symbol === '') {
							emptyCells.push({ row: r, col: c })
						}
					}
				}
				if (emptyCells.length === 0) {
					console.error('No valid moves available on the board')
					return null
				}
				move = emptyCells[Math.floor(Math.random() * emptyCells.length)]
				console.log('AI used fallback random move:', move)
			}

			await ctx.runMutation(api.ai.ai_controller.recordAIMove, {
				gameId,
				row: move.row,
				col: move.col,
				playerId,
			})

			return move
		} catch (error) {
			console.error('Error generating AI move, falling back to random:', error)

			// On any API error (quota, network, etc.) — fall back to a random empty cell
			// so the game never gets permanently stuck
			const emptyCells: { row: number; col: number }[] = []
			for (let r = 0; r < fieldSize; r++) {
				for (let c = 0; c < fieldSize; c++) {
					if (board[r][c].symbol === '') {
						emptyCells.push({ row: r, col: c })
					}
				}
			}
			if (emptyCells.length === 0) return null

			const fallback = emptyCells[Math.floor(Math.random() * emptyCells.length)]
			console.log('AI fallback random move:', fallback)

			await ctx.runMutation(api.ai.ai_controller.recordAIMove, {
				gameId,
				row: fallback.row,
				col: fallback.col,
				playerId,
			})

			return fallback
		}
	},
})
