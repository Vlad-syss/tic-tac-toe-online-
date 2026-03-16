import { v } from 'convex/values'
import { api } from '../_generated/api'
import { Id } from '../_generated/dataModel'
import { mutation, query } from '../_generated/server'
import { calculateElo, calculateEloDraw } from '../utils/elo'
import { checkWinCondition, isBoardFull } from '../utils/gameLogic'

export const createGameWithAI = mutation({
	args: { userId: v.id('users'), fieldSize: v.number() },
	handler: async (ctx, { userId, fieldSize }) => {
		const aiPlayer = await ctx.db.insert('users', {
			name: 'AI Player',
			isAI: true,
			onlineRating: 9999,
			offlineRating: 9999,
			totalGamesPlayed: 0,
			highestWinStreak: 0,
			currentWinStreak: 0,
			totalWins: 0,
			avatarUrl:
				'https://img.freepik.com/free-vector/cute-robot-wearing-hat-flying-cartoon-vector-icon-illustration-science-technology-icon-isolated_138676-5186.jpg?t=st=1742921694~exp=1742925294~hmac=eafbb3be7fdbe041f936c7cd5d0aaf912d20abe63cd868360a6b6dcb34b430d6&w=740',
		})

		// Randomly assign symbols: human gets X or O, AI gets the other
		const symbols: ('X' | 'O')[] = ['X', 'O']
		const userSymbol = symbols[Math.floor(Math.random() * symbols.length)]
		const aiSymbol: 'X' | 'O' = userSymbol === 'X' ? 'O' : 'X'

		const board = Array.from({ length: fieldSize }, (_, rowIndex) =>
			Array.from({ length: fieldSize }, (_, colIndex) => ({
				symbol: '' as 'X' | 'O' | 'Square' | 'Triangle' | '',
				row: rowIndex,
				col: colIndex,
			}))
		)

		const userSymbols: Record<Id<'users'>, 'X' | 'O' | 'Square' | 'Triangle'> = {
			[userId as Id<'users'>]: userSymbol,
			[aiPlayer as Id<'users'>]: aiSymbol,
		}

		// X always goes first
		const firstTurn: Id<'users'> = userSymbol === 'X' ? userId : (aiPlayer as Id<'users'>)

		const gameId = await ctx.db.insert('games', {
			userIds: [userId, aiPlayer],
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

		// If AI is X (goes first), schedule its first move immediately
		if (aiSymbol === 'X') {
			await ctx.scheduler.runAfter(0, api.ai.ai_actions.generateAIMove, {
				board,
				fieldSize,
				gameId,
				playerId: aiPlayer as Id<'users'>,
				aiSymbol,
			})
		}

		return await ctx.db.get(gameId)
	},
})

// Query used by ai_actions to get AI player ID from a game (not exposed to frontend)
export const getAIPlayerId = query({
	args: { gameId: v.id('games') },
	handler: async (ctx, { gameId }) => {
		const game = await ctx.db.get(gameId)
		if (!game) return null
		for (const uid of game.userIds) {
			const u = await ctx.db.get(uid)
			if (u?.isAI) return uid
		}
		return null
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
		if (!game) {
			console.error('Game not found in recordAIMove')
			return { success: false }
		}

		// Guard: only allow if it's actually the AI's turn
		if (game.gameStatus !== 'in_progress') {
			return { success: false, reason: 'game_not_active' }
		}

		// Guard: cell must be empty
		if (game.board[row]?.[col]?.symbol !== '') {
			console.error('recordAIMove: cell already occupied', { row, col })
			return { success: false, reason: 'cell_occupied' }
		}

		const aiSymbol = game.userSymbols[playerId]
		if (!aiSymbol) {
			console.error('recordAIMove: AI symbol not found for playerId', playerId)
			return { success: false }
		}

		const newBoard = game.board.map((rowArr, rowIndex) =>
			rowArr.map((cell, colIndex) =>
				rowIndex === row && colIndex === col
					? { ...cell, symbol: aiSymbol }
					: cell
			)
		)

		const isWin = checkWinCondition(newBoard, aiSymbol, game.fieldSize)
		const isDraw = !isWin && isBoardFull(newBoard)

		// Find human player (non-AI)
		const humanId = game.userIds.find(id => id !== playerId)

		if (isWin || isDraw) {
			// Update game status
			await ctx.db.patch(gameId, {
				board: newBoard,
				gameStatus: 'completed',
				winnerId: isWin ? (playerId as Id<'users'>) : undefined,
				isDraw: isDraw,
				updatedAt: new Date().toISOString(),
			})

			// Update human player stats
			if (humanId) {
				const humanPlayer = await ctx.db.get(humanId)
				if (humanPlayer && !humanPlayer.isAI) {
					const humanRating = humanPlayer.offlineRating ?? 1000
					if (isWin) {
						// AI won → human lost
						const { newLoserRating } = calculateElo(1200, humanRating)
						await ctx.db.patch(humanPlayer._id, {
							totalGamesPlayed: (humanPlayer.totalGamesPlayed || 0) + 1,
							currentWinStreak: 0,
							offlineRating: newLoserRating,
						})
					} else {
						// Draw
						const { newRating1 } = calculateEloDraw(humanRating, 1200)
						await ctx.db.patch(humanPlayer._id, {
							totalGamesPlayed: (humanPlayer.totalGamesPlayed || 0) + 1,
							currentWinStreak: 0,
							offlineRating: newRating1,
						})
					}
				}
			}

			// Delete the temporary AI user
			await ctx.db.delete(playerId)

			return { success: true, isWin, isDraw }
		}

		// Game continues — give turn back to human
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
		if (!game) {
			console.error('aiMakeMove: Game not found')
			return null
		}

		if (game.gameStatus !== 'in_progress') {
			return { skipped: true, reason: 'game_not_active' }
		}

		if (game.currentTurn !== playerId) {
			console.log('aiMakeMove: not AI turn, skipping')
			return { skipped: true }
		}

		const aiSymbol = game.userSymbols[playerId]
		if (!aiSymbol) {
			console.error('aiMakeMove: AI symbol not found')
			return null
		}

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
