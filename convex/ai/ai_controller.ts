import { v } from 'convex/values'
import { api } from '../_generated/api'
import { Id } from '../_generated/dataModel'
import { mutation, query } from '../_generated/server'
import { calculateElo, calculateEloDraw } from '../utils/elo'
import { checkWinCondition, createEmptyBoard, isBoardFull } from '../utils/gameLogic'

const AI_SENTINEL_EMAIL = 'ai-player@system'
const AI_AVATAR_URL =
	'https://img.freepik.com/free-vector/cute-robot-wearing-hat-flying-cartoon-vector-icon-illustration-science-technology-icon-isolated_138676-5186.jpg?t=st=1742921694~exp=1742925294~hmac=eafbb3be7fdbe041f936c7cd5d0aaf912d20abe63cd868360a6b6dcb34b430d6&w=740'

export const createGameWithAI = mutation({
	args: { userId: v.id('users'), fieldSize: v.number() },
	handler: async (ctx, { userId, fieldSize }) => {
		let aiUser = await ctx.db
			.query('users')
			.withIndex('by_email', q => q.eq('email', AI_SENTINEL_EMAIL))
			.unique()

		if (!aiUser) {
			const aiId = await ctx.db.insert('users', {
				name: 'AI Player',
				email: AI_SENTINEL_EMAIL,
				isAI: true,
				onlineRating: 9999,
				offlineRating: 9999,
				totalGamesPlayed: 0,
				highestWinStreak: 0,
				currentWinStreak: 0,
				totalWins: 0,
				avatarUrl: AI_AVATAR_URL,
			})
			aiUser = (await ctx.db.get(aiId))!
		}

		const aiPlayerId = aiUser._id

		const userSymbol: 'X' | 'O' = Math.random() < 0.5 ? 'X' : 'O'
		const aiSymbol: 'X' | 'O' = userSymbol === 'X' ? 'O' : 'X'

		const board = createEmptyBoard(fieldSize)

		const userSymbols: Record<string, 'X' | 'O' | 'Square' | 'Triangle'> = {
			[userId]: userSymbol,
			[aiPlayerId]: aiSymbol,
		}

		const firstTurn: Id<'users'> = userSymbol === 'X' ? userId : aiPlayerId

		const gameId = await ctx.db.insert('games', {
			userIds: [userId, aiPlayerId],
			userSymbols,
			gameStatus: 'in_progress',
			gameMode: 'AI',
			fieldSize,
			isDraw: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			board,
			currentTurn: firstTurn,
		})

		if (aiSymbol === 'X') {
			await ctx.scheduler.runAfter(0, api.ai.ai_actions.generateAIMove, {
				board,
				fieldSize,
				gameId,
				playerId: aiPlayerId,
				aiSymbol,
			})
		}

		return await ctx.db.get(gameId)
	},
})

export const getAIPlayerId = query({
	args: { gameId: v.id('games') },
	handler: async (ctx, { gameId }) => {
		const game = await ctx.db.get(gameId)
		if (!game || game.gameMode !== 'AI') return null
		const aiId = game.userIds[1]
		return aiId ?? null
	},
})

export const recordAIMove = mutation({
	args: {
		gameId: v.id('games'),
		row: v.number(),
		col: v.number(),
		playerId: v.id('users'),
	},
	handler: async (ctx, { gameId, row, col, playerId }) => {
		const game = await ctx.db.get(gameId)
		if (!game) return { success: false }

		if (game.gameStatus !== 'in_progress') {
			return { success: false, reason: 'game_not_active' }
		}

		if (game.board[row]?.[col]?.symbol !== '') {
			return { success: false, reason: 'cell_occupied' }
		}

		const aiSymbol = game.userSymbols[playerId]
		if (!aiSymbol) return { success: false }

		const newBoard = game.board.map((rowArr, rowIndex) =>
			rowArr.map((cell, colIndex) =>
				rowIndex === row && colIndex === col
					? { ...cell, symbol: aiSymbol }
					: cell
			)
		)

		const isWin = checkWinCondition(newBoard, aiSymbol, game.fieldSize)
		const isDraw = !isWin && isBoardFull(newBoard)

		const humanId = game.userIds.find(id => id !== playerId)

		if (isWin || isDraw) {
			await ctx.db.patch(gameId, {
				board: newBoard,
				gameStatus: 'completed',
				winnerId: isWin ? (playerId as Id<'users'>) : undefined,
				isDraw: isDraw,
				updatedAt: new Date().toISOString(),
			})

			if (humanId) {
				const humanPlayer = await ctx.db.get(humanId)
				if (humanPlayer && !humanPlayer.isAI) {
					const humanRating = humanPlayer.offlineRating ?? 1000
					if (isWin) {
						const { newLoserRating } = calculateElo(1200, humanRating)
						await ctx.db.patch(humanPlayer._id, {
							totalGamesPlayed: (humanPlayer.totalGamesPlayed || 0) + 1,
							currentWinStreak: 0,
							offlineRating: newLoserRating,
						})
					} else {
						const { newRating1 } = calculateEloDraw(humanRating, 1200)
						await ctx.db.patch(humanPlayer._id, {
							totalGamesPlayed: (humanPlayer.totalGamesPlayed || 0) + 1,
							currentWinStreak: 0,
							offlineRating: newRating1,
						})
					}
				}
			}

			return { success: true, isWin, isDraw }
		}

		await ctx.db.patch(gameId, {
			board: newBoard,
			updatedAt: new Date().toISOString(),
			currentTurn: humanId as Id<'users'>,
		})

		return { success: true }
	},
})

export const aiMakeMove = mutation({
	args: { gameId: v.id('games'), playerId: v.id('users') },
	handler: async (ctx, { gameId, playerId }) => {
		const game = await ctx.db.get(gameId)
		if (!game) return null

		if (game.gameStatus !== 'in_progress') {
			return { skipped: true, reason: 'game_not_active' }
		}

		if (game.currentTurn !== playerId) {
			return { skipped: true }
		}

		const aiSymbol = game.userSymbols[playerId]
		if (!aiSymbol) return null

		await ctx.scheduler.runAfter(0, api.ai.ai_actions.generateAIMove, {
			board: game.board,
			fieldSize: game.fieldSize,
			gameId,
			playerId,
			aiSymbol,
		})

		return { scheduled: true }
	},
})
