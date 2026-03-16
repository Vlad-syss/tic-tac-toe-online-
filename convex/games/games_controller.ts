import { v } from 'convex/values'
import { Doc, Id } from '../_generated/dataModel'
import { mutation, query } from '../_generated/server'
import { calculateElo, calculateEloDraw } from '../utils/elo'
import { checkWinCondition, isBoardFull } from '../utils/gameLogic'

export const startNewGame = mutation({
	args: {
		userIds: v.array(v.id('users')),
		gameMode: v.union(
			v.literal('AI'),
			v.literal('Online'),
			v.literal('1v1v1v1')
		),
		fieldSize: v.number(),
		firstPlayerId: v.optional(v.id('users')),
		inviteCode: v.optional(v.string()),
	},
	handler: async (ctx, { userIds, gameMode, fieldSize, firstPlayerId, inviteCode }) => {
		const now = new Date().toISOString()

		// Correctly initialize board with row/col indices
		const board = Array.from({ length: fieldSize }, (_, rowIndex) =>
			Array.from({ length: fieldSize }, (_, colIndex) => ({
				symbol: '' as 'X' | 'O' | 'Square' | 'Triangle' | '',
				row: rowIndex,
				col: colIndex,
			}))
		)

		const startingPlayerId = firstPlayerId ?? userIds[0]

		const symbols: ('X' | 'O' | 'Square' | 'Triangle')[] = ['X', 'O', 'Square', 'Triangle']
		const userSymbols: Record<string, 'X' | 'O' | 'Square' | 'Triangle'> = {}
		userIds.forEach((userId, index) => {
			userSymbols[userId] = symbols[index % symbols.length]
		})

		const gameId = await ctx.db.insert('games', {
			userIds,
			gameStatus: 'waiting',
			gameMode,
			fieldSize,
			isDraw: false,
			createdAt: now,
			updatedAt: now,
			board,
			currentTurn: startingPlayerId,
			userSymbols,
			inviteCode,
		})

		return gameId
	},
})

export const getGame = query({
	args: {
		gameId: v.union(v.id('games'), v.null()),
	},
	handler: async (ctx, { gameId }) => {
		if (!gameId) return null
		return await ctx.db.get(gameId)
	},
})

export const makeMove = mutation({
	args: {
		gameId: v.id('games'),
		row: v.number(),
		col: v.number(),
	},
	handler: async (ctx, { gameId, row, col }) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error('Not authenticated')

		const user = await ctx.db
			.query('users')
			.withIndex('by_email', q => q.eq('email', identity.email))
			.unique()

		if (!user) throw new Error('User not found')
		const playerId = user._id

		const game = await ctx.db.get(gameId)
		if (!game) throw new Error('Game not found')

		if (game.gameStatus !== 'waiting' && game.gameStatus !== 'in_progress') {
			throw new Error('Game is not active')
		}

		if (game.currentTurn !== playerId) {
			throw new Error('Not your turn')
		}

		if (!game.userIds.includes(playerId)) {
			throw new Error('You are not part of this game')
		}

		if (row < 0 || row >= game.fieldSize || col < 0 || col >= game.fieldSize) {
			throw new Error('Move is out of bounds')
		}

		if (game.board[row][col].symbol !== '') {
			throw new Error('This cell is already occupied')
		}

		// Derive symbol server-side — never trust client
		const symbol = game.userSymbols[playerId]
		if (!symbol) throw new Error('Player has no symbol assigned in this game')

		const newBoard = game.board.map((rowArr, rowIndex) =>
			rowArr.map((cell, colIndex) =>
				rowIndex === row && colIndex === col ? { ...cell, symbol } : cell
			)
		)

		const isWin = checkWinCondition(newBoard, symbol, game.fieldSize)
		const isDraw = !isWin && isBoardFull(newBoard)

		const updates: Partial<Doc<'games'>> = {
			board: newBoard,
			updatedAt: new Date().toISOString(),
			gameStatus: game.gameStatus === 'waiting' ? 'in_progress' : game.gameStatus,
		}

		if (isWin) {
			updates.gameStatus = 'completed'
			updates.winnerId = playerId
			updates.isDraw = false
		} else if (isDraw) {
			updates.gameStatus = 'completed'
			updates.isDraw = true
		} else {
			const playerIndex = game.userIds.indexOf(playerId)
			const nextPlayerIndex = (playerIndex + 1) % game.userIds.length
			updates.currentTurn = game.userIds[nextPlayerIndex] as Id<'users'>
		}

		await ctx.db.patch(gameId, updates)

		// Handle stats and cleanup when game ends
		if (isWin || isDraw) {
			const isAIGame = game.gameMode === 'AI'
			const allPlayers = await Promise.all(game.userIds.map(id => ctx.db.get(id)))

			if (isWin) {
				const winner = allPlayers.find(p => p?._id === playerId)
				if (winner && !winner.isAI) {
					const ratingField = isAIGame ? 'offlineRating' : 'onlineRating'
					const opponents = allPlayers.filter(p => p && p._id !== playerId)
					const avgOpponentRating =
						opponents.reduce((sum, p) => sum + ((p as any)?.[ratingField] ?? 1000), 0) /
						Math.max(opponents.length, 1)

					const winnerRating = (winner as any)[ratingField] ?? 1000
					const { newWinnerRating } = calculateElo(winnerRating, avgOpponentRating)

					const newStreak = (winner.currentWinStreak ?? 0) + 1
					const patch: Partial<Doc<'users'>> = {
						totalGamesPlayed: (winner.totalGamesPlayed || 0) + 1,
						totalWins: (winner.totalWins || 0) + 1,
						currentWinStreak: newStreak,
						highestWinStreak: Math.max(newStreak, winner.highestWinStreak || 0),
					}
					patch[ratingField] = newWinnerRating
					await ctx.db.patch(winner._id, patch)
				}

				const losers = allPlayers.filter(p => p && p._id !== playerId && !p.isAI)
				for (const loser of losers) {
					if (!loser) continue
					const ratingField = isAIGame ? 'offlineRating' : 'onlineRating'
					const loserRating = (loser as any)[ratingField] ?? 1000
					const winnerRating = (winner as any)?.[isAIGame ? 'offlineRating' : 'onlineRating'] ?? 1000
					const { newLoserRating } = calculateElo(winnerRating, loserRating)
					const patch: Partial<Doc<'users'>> = {
						totalGamesPlayed: (loser.totalGamesPlayed || 0) + 1,
						currentWinStreak: 0,
					}
					patch[ratingField] = newLoserRating
					await ctx.db.patch(loser._id, patch)
				}
			} else if (isDraw) {
				const realPlayers = allPlayers.filter(p => p && !p.isAI)
				const ratingField = isAIGame ? 'offlineRating' : 'onlineRating'
				const avgRating =
					realPlayers.reduce((sum, p) => sum + ((p as any)?.[ratingField] ?? 1000), 0) /
					Math.max(realPlayers.length, 1)

				for (const player of realPlayers) {
					if (!player) continue
					const playerRating = (player as any)[ratingField] ?? 1000
					const { newRating1 } = calculateEloDraw(playerRating, avgRating)
					const patch: Partial<Doc<'users'>> = {
						totalGamesPlayed: (player.totalGamesPlayed || 0) + 1,
						currentWinStreak: 0,
					}
					patch[ratingField] = newRating1
					await ctx.db.patch(player._id, patch)
				}
			}

			// Auto-delete AI user if this was an AI game (human won or drew)
			if (isAIGame) {
				for (const player of allPlayers) {
					if (player?.isAI) {
						await ctx.db.delete(player._id)
					}
				}
			}
		}

		return { success: true, isWin, isDraw }
	},
})

export const getGameByInviteCode = query({
	args: { inviteCode: v.string() },
	handler: async (ctx, { inviteCode }) => {
		return await ctx.db
			.query('games')
			.withIndex('by_invite_code', q => q.eq('inviteCode', inviteCode))
			.unique()
	},
})

export const joinGameByInvite = mutation({
	args: {
		inviteCode: v.string(),
		userId: v.id('users'),
	},
	handler: async (ctx, { inviteCode, userId }) => {
		const game = await ctx.db
			.query('games')
			.withIndex('by_invite_code', q => q.eq('inviteCode', inviteCode))
			.unique()

		if (!game) throw new Error('Game not found with this invite code')
		if (game.gameStatus !== 'waiting') throw new Error('Game is no longer accepting players')
		if (game.userIds.includes(userId)) return game._id

		const maxPlayers = game.gameMode === '1v1v1v1' ? 4 : 2
		if (game.userIds.length >= maxPlayers) throw new Error('Game is full')

		const symbols: ('X' | 'O' | 'Square' | 'Triangle')[] = ['X', 'O', 'Square', 'Triangle']
		const newSymbol = symbols[game.userIds.length % symbols.length]

		const updatedUserIds = [...game.userIds, userId]
		const updatedUserSymbols = { ...game.userSymbols, [userId]: newSymbol }

		const updates: Partial<Doc<'games'>> = {
			userIds: updatedUserIds,
			userSymbols: updatedUserSymbols,
			updatedAt: new Date().toISOString(),
		}

		const isOnlineFull = game.gameMode === 'Online' && updatedUserIds.length >= 2
		const isFourFull = game.gameMode === '1v1v1v1' && updatedUserIds.length >= 4
		if (isOnlineFull || isFourFull) {
			updates.gameStatus = 'in_progress'
		}

		await ctx.db.patch(game._id, updates)
		return game._id
	},
})

export const getCurrentBoardState = query({
	args: { gameId: v.id('games') },
	handler: async (ctx, { gameId }) => {
		const game = await ctx.db.get(gameId)
		if (!game) return null
		return {
			board: game.board,
			gameStatus: game.gameStatus,
			currentTurn: game.currentTurn,
			isDraw: game.isDraw,
			winnerId: game.winnerId,
		}
	},
})

export const updateGameStatus = mutation({
	args: {
		gameId: v.id('games'),
		gameStatus: v.union(
			v.literal('waiting'),
			v.literal('in_progress'),
			v.literal('completed'),
			v.literal('canceled')
		),
		winnerId: v.optional(v.id('users')),
		isDraw: v.optional(v.boolean()),
	},
	handler: async (ctx, { gameId, gameStatus, winnerId, isDraw }) => {
		const game = await ctx.db.get(gameId)
		if (!game) throw new Error('Game not found')

		const updates: Partial<Doc<'games'>> = {
			gameStatus,
			updatedAt: new Date().toISOString(),
		}
		if (winnerId !== undefined) updates.winnerId = winnerId
		if (isDraw !== undefined) updates.isDraw = isDraw

		await ctx.db.patch(gameId, updates)
		return gameId
	},
})
