import { GoogleGenerativeAI } from '@google/generative-ai'
import { v } from 'convex/values'
import { api } from '../_generated/api' // Import api
import { Doc, Id } from '../_generated/dataModel'
import { mutation } from '../_generated/server'
import { checkWinCondition, isBoardFull } from '../games/games_controller'

const client = new GoogleGenerativeAI(process.env.VITE_GEMINI_APIKEY as string)
const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' })

export const createGameWithAI = mutation({
	args: { userId: v.id('users'), fieldSize: v.number() },
	handler: async (ctx, { userId, fieldSize }) => {
		const aiPlayer = await ctx.db.insert('users', {
			name: 'AI Player',
			onlineRating: 9999,
			offlineRating: 9999,
			totalGamesPlayed: 0,
			highestWinStreak: 0,
			totalWins: 0,
			avatarUrl:
				'https://img.freepik.com/free-vector/cute-robot-wearing-hat-flying-cartoon-vector-icon-illustration-science-technology-icon-isolated_138676-5186.jpg?t=st=1742921694~exp=1742925294~hmac=eafbb3be7fdbe041f936c7cd5d0aaf912d20abe63cd868360a6b6dcb34b430d6&w=740',
		})
		const symbols = ['X', 'O']
		const userSymbol = symbols[Math.floor(Math.random() * symbols.length)]
		const aiSymbol = userSymbol === 'X' ? 'O' : 'X'
		const board = Array.from({ length: fieldSize }, (_, rowIndex) =>
			Array.from({ length: fieldSize }, (_, colIndex) => ({
				symbol: '' as 'X' | 'O' | 'Square' | 'Triangle' | '',
				row: rowIndex,
				col: colIndex,
			}))
		)
		const userSymbols: Record<
			Id<'users'>,
			'X' | 'O' | 'Square' | 'Triangle'
		> = {
			[userId as Id<'users'>]: userSymbol as 'X' | 'O' | 'Square' | 'Triangle',
			[aiPlayer as Id<'users'>]: aiSymbol as 'X' | 'O' | 'Square' | 'Triangle',
		}
		const gameResult = await ctx.db.insert('games', {
			userIds: [userId, aiPlayer],
			userSymbols,
			gameStatus: 'in_progress',
			gameMode: 'AI',
			fieldSize,
			isDraw: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			board,
			currentTurn: userSymbol === 'X' ? userId : aiPlayer,
		})
		const game = await ctx.db.get(gameResult)

		if (aiSymbol === 'X' && game) {
			// Перевіряємо, чи AI починає гру
			await ctx.scheduler.runAfter(500, api.ai.ai_actions.generateAIMove, {
				board: game.board,
				fieldSize: game.fieldSize,
				gameId: game._id,
				playerId: aiPlayer,
			})
		}

		return game
	},
})

export const recordAIMove = mutation({
	args: {
		gameId: v.id('games'),
		row: v.number(),
		col: v.number(),
		symbol: v.optional(
			v.union(
				v.literal('X'),
				v.literal('O'),
				v.literal('Square'),
				v.literal('Triangle')
			)
		),
		playerId: v.optional(v.id('users')),
	},
	handler: async (ctx, { gameId, row, col, symbol, playerId }) => {
		const game = await ctx.db.get(gameId)
		if (!game) {
			console.error('Game not found.')
			return { success: false }
		}

		// Оновлюємо дошку: ставимо символ у вказану клітинку
		const newBoard = game.board.map((rowArr, rowIndex) =>
			rowArr.map((cell, colIndex) =>
				rowIndex === row && colIndex === col
					? { ...cell, symbol: symbol ?? cell.symbol }
					: cell
			)
		)

		let isWin = false
		let isDraw = false
		let nextPlayerId: Id<'users'> | undefined

		console.log(symbol, playerId)

		if (symbol && playerId) {
			isWin = checkWinCondition(newBoard, symbol, game.fieldSize)
			isDraw = !isWin && isBoardFull(newBoard)

			const updates: Partial<Doc<'games'>> = {
				board: newBoard,
				updatedAt: new Date().toISOString(),
			}

			// Змінюємо статус гри, якщо потрібно
			if (game.gameStatus === 'waiting') {
				updates.gameStatus = 'in_progress'
			}

			if (isWin) {
				updates.gameStatus = 'completed'
				updates.isDraw = false
			} else if (isDraw) {
				updates.gameStatus = 'completed'
				updates.isDraw = true
			} else {
				const playerIndex = game.userIds.indexOf(playerId)
				const nextPlayerIndex = (playerIndex + 1) % game.userIds.length
				nextPlayerId = game.userIds[nextPlayerIndex]
				updates.currentTurn = nextPlayerId
			}

			await ctx.db.patch(gameId, updates)

			// Якщо гра завершена, оновлюємо статистику гравця
			if (playerId && (isWin || isDraw)) {
				const user = await ctx.db.get(playerId)
				if (!user) throw new Error('User not found')
				await ctx.db.patch(playerId, {
					totalGamesPlayed: (user.totalGamesPlayed || 0) + 1,
				})
			}
		} else {
			// Якщо символ або playerId відсутні, просто оновлюємо дошку без зміни статусу і ходу
			await ctx.db.patch(gameId, {
				board: newBoard,
				updatedAt: new Date().toISOString(),
			})
		}

		return {
			success: true,
			isWin,
			isDraw,
		}
	},
})

export const deleteAIUser = mutation({
	args: {
		aiUserId: v.id('users'),
	},
	handler: async (ctx, { aiUserId }) => {
		const aiUser = await ctx.db.get(aiUserId)
		if (!aiUser) {
			console.error('AI user not found.')
			return null
		}

		await ctx.db.delete(aiUserId)

		return { success: true }
	},
})

export const aiMakeMove = mutation({
	args: { gameId: v.id('games'), playerId: v.id('users') },
	handler: async (ctx, { gameId, playerId }) => {
		const game = await ctx.db.get(gameId)

		if (!game) {
			console.error('Game not found.')
			return null
		}
		if (game.currentTurn !== playerId) {
			console.log('AI turn is not now, skipping aiMakeMove')
			return { skipped: true }
		}
		const board = game.board
		ctx.scheduler.runAfter(500, api.ai.ai_actions.generateAIMove, {
			board,
			fieldSize: game.fieldSize,
			gameId,
			playerId,
		})
		return { scheduled: true }
	},
})
