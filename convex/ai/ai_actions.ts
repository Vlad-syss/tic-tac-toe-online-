'use node'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { v } from 'convex/values'
import { api } from '../_generated/api'
import { action } from '../_generated/server'

console.log('Gemini API Key:', process.env.VITE_GEMINI_APIKEY)
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
	},
	handler: async (ctx, { board, fieldSize, gameId, playerId }) => {
		try {
			const boardString = board
				.map(row => row.map(cell => cell.symbol || ' ').join('|'))
				.join('\n')

			const prompt = `
					You are playing a tic-tac-toe game on a ${fieldSize}x${fieldSize} board.
					You are playing as 'O' and your opponent is 'X'.
					Current board state:
					${boardString}

					Analyze the board and provide the best move as a JSON object with row and column indices (0-based).
					Only return the JSON object in this format: {"row": number, "col": number}
					Make sure the move is valid (the cell is empty).
					`

			const result = await model.generateContent(prompt)
			const response = result.response.text()

			let move
			try {
				const jsonMatch = response.match(/\{[\s\S]*?\}/) // More aggressive match
				if (jsonMatch) {
					move = JSON.parse(jsonMatch[0])
				} else {
					throw new Error('Could not find JSON in response')
				}
			} catch (parseError) {
				console.error('Failed to parse AI response:', response, parseError)
				throw new Error('Invalid AI response format')
			}

			if (
				typeof move.row !== 'number' ||
				typeof move.col !== 'number' ||
				move.row < 0 ||
				move.row >= fieldSize ||
				move.col < 0 ||
				move.col >= fieldSize
			) {
				throw new Error('AI returned invalid move coordinates')
			}

			// Check if the cell is already occupied
			if (board[move.row][move.col].symbol !== '') {
				// Find a random empty cell as fallback
				const emptyCells = []
				for (let r = 0; r < fieldSize; r++) {
					for (let c = 0; c < fieldSize; c++) {
						if (board[r][c].symbol === '') {
							emptyCells.push({ row: r, col: c })
						}
					}
				}

				if (emptyCells.length === 0) {
					throw new Error('No valid moves available')
				}

				move = emptyCells[Math.floor(Math.random() * emptyCells.length)]
			}

			await ctx.runMutation(api.ai.ai_controller.recordAIMove, {
				gameId,
				row: move.row,
				col: move.col,
			})

			return move
		} catch (error) {
			console.error('Error generating AI move:', error)
			return null
		}
	},
})
