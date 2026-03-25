'use node'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { v } from 'convex/values'
import { api } from '../_generated/api'
import { action } from '../_generated/server'

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
		const getEmptyCells = () => {
			const cells: { row: number; col: number }[] = []
			for (let r = 0; r < fieldSize; r++) {
				for (let c = 0; c < fieldSize; c++) {
					if (board[r]?.[c]?.symbol === '') {
						cells.push({ row: r, col: c })
					}
				}
			}
			return cells
		}

		const pickRandom = (cells: { row: number; col: number }[]) =>
			cells[Math.floor(Math.random() * cells.length)]!

		async function tryGenerateAIMove(
			prompt: string,
			retries = 3,
			delayMs = 1000
		): Promise<string> {
			for (let attempt = 1; attempt <= retries; attempt++) {
				try {
					const result = await model.generateContent(prompt)
					return result.response.text()
				} catch (error: unknown) {
					console.error(`AI generation attempt ${attempt} failed:`, error)
					if (attempt === retries) throw error
					const err = error as { status?: number }
					if (err.status === 503) {
						await new Promise(resolve => setTimeout(resolve, delayMs))
					} else {
						throw error
					}
				}
			}
			throw new Error('Unhandled AI error')
		}

		try {
			const humanSymbol = aiSymbol === 'X' ? 'O' : 'X'

			const boardString = board
				.map(row => row.map(cell => cell.symbol || '.').join('|'))
				.join('\n')

			const winLength = fieldSize <= 3 ? 3 : fieldSize <= 5 ? 4 : 6

		const prompt = `You are playing tic-tac-toe on a ${fieldSize}x${fieldSize} board.
You are '${aiSymbol}'. Your opponent is '${humanSymbol}'.
Empty cells are shown as '.'.

Board (0-indexed rows top-to-bottom, columns left-to-right):
${boardString}

Win condition: get ${winLength} in a row (horizontally, vertically, or diagonally).

Respond with ONLY valid JSON (no other text): {"row": number, "col": number}
Choose an empty cell ('.') and make the best strategic move for '${aiSymbol}'.`

			const response = await tryGenerateAIMove(prompt)

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
						board[parsed.row]?.[parsed.col]?.symbol === ''
					) {
						move = parsed
					}
				}
			} catch {
			}

			if (!move) {
				const emptyCells = getEmptyCells()
				if (emptyCells.length === 0) return null
				move = pickRandom(emptyCells)
			}

			await ctx.runMutation(api.ai.ai_controller.recordAIMove, {
				gameId,
				row: move.row,
				col: move.col,
				playerId,
			})

			return move
		} catch {
			const emptyCells = getEmptyCells()
			if (emptyCells.length === 0) return null

			const fallback = pickRandom(emptyCells)

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
