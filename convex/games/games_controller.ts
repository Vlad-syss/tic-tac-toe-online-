import { v } from 'convex/values'
import { api } from '../_generated/api'
import { Doc, Id } from '../_generated/dataModel'
import { mutation, query } from '../_generated/server'
import { paginationOptsValidator } from 'convex/server'
import { calculateElo, calculateEloDraw } from '../utils/elo'
import { checkWinCondition, isBoardFull, createEmptyBoard } from '../utils/gameLogic'

const getRating = (player: Doc<'users'>, isAI: boolean): number =>
	isAI ? (player.offlineRating ?? 1000) : (player.onlineRating ?? 1000)

const patchRating = (patch: Record<string, unknown>, isAI: boolean, value: number) => {
	if (isAI) patch.offlineRating = value
	else patch.onlineRating = value
}

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

		const board = createEmptyBoard(fieldSize)

		const startingPlayerId = firstPlayerId ?? userIds[0]

		const symbols = ['X', 'O', 'Square', 'Triangle'] as const
		const userSymbols: Record<string, 'X' | 'O' | 'Square' | 'Triangle'> = {}
		userIds.forEach((userId, index) => {
			userSymbols[userId] = symbols[index % symbols.length]!
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
			moveMadeAt: now,
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

const FOUR_PLAYER_ELO = [30, 15, 0, -30] as const

const getNextActivePlayer = (
	userIds: Id<'users'>[],
	currentIndex: number,
	eliminatedIds: Set<string>
): Id<'users'> => {
	let next = (currentIndex + 1) % userIds.length
	while (eliminatedIds.has(userIds[next]!)) {
		next = (next + 1) % userIds.length
	}
	return userIds[next] as Id<'users'>
}

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

		const eliminated = game.eliminatedPlayers ?? []
		if (eliminated.some(ep => ep.userId === playerId)) {
			throw new Error('You have been eliminated')
		}

		if (row < 0 || row >= game.fieldSize || col < 0 || col >= game.fieldSize) {
			throw new Error('Move is out of bounds')
		}

		if (game.board[row]?.[col]?.symbol !== '') {
			throw new Error('This cell is already occupied')
		}

		const symbol = game.userSymbols[playerId]
		if (!symbol) throw new Error('Player has no symbol assigned in this game')

		const newBoard = game.board.map((rowArr, rowIndex) =>
			rowArr.map((cell, colIndex) =>
				rowIndex === row && colIndex === col ? { ...cell, symbol } : cell
			)
		)

		const isWin = checkWinCondition(newBoard, symbol, game.fieldSize)
		const isDraw = !isWin && isBoardFull(newBoard)
		const isFourPlayer = game.gameMode === '1v1v1v1'

		const updates: Partial<Doc<'games'>> = {
			board: newBoard,
			updatedAt: new Date().toISOString(),
			moveMadeAt: new Date().toISOString(),
			gameStatus: game.gameStatus === 'waiting' ? 'in_progress' : game.gameStatus,
		}

		if (isFourPlayer) {
			const eliminatedIds = new Set(eliminated.map(ep => ep.userId as string))
			const activePlayers = game.userIds.filter(id => !eliminatedIds.has(id))

			if (isWin) {
				const position = eliminated.length + 1
				const eloChange = FOUR_PLAYER_ELO[position - 1] ?? 0
				const newEliminated = [...eliminated, { userId: playerId, position, eloChange }]
				updates.eliminatedPlayers = newEliminated

				const newEliminatedIds = new Set([...eliminatedIds, playerId as string])
				const remainingPlayers = game.userIds.filter(id => !newEliminatedIds.has(id))

				if (remainingPlayers.length === 1) {
					const lastPlayerId = remainingPlayers[0] as Id<'users'>
					const lastElo = FOUR_PLAYER_ELO[newEliminated.length] ?? -30
					updates.eliminatedPlayers = [
						...newEliminated,
						{ userId: lastPlayerId, position: newEliminated.length + 1, eloChange: lastElo },
					]
					updates.gameStatus = 'completed'
					updates.winnerId = (newEliminated[0] as { userId: Id<'users'> }).userId
					updates.isDraw = false
				} else {
					const playerIndex = game.userIds.indexOf(playerId)
					updates.currentTurn = getNextActivePlayer(game.userIds, playerIndex, newEliminatedIds)
				}

				// Apply ELO for the eliminated player
				const playerDoc = await ctx.db.get(playerId)
				if (playerDoc) {
					const currentRating = playerDoc.onlineRating ?? 1000
					const patch: Record<string, unknown> = {
						onlineRating: currentRating + eloChange,
						totalGamesPlayed: (playerDoc.totalGamesPlayed || 0) + 1,
					}
					if (position === 1) {
						const newStreak = (playerDoc.currentWinStreak ?? 0) + 1
						patch.totalWins = (playerDoc.totalWins || 0) + 1
						patch.currentWinStreak = newStreak
						patch.highestWinStreak = Math.max(newStreak, playerDoc.highestWinStreak || 0)
					} else {
						patch.currentWinStreak = 0
					}
					await ctx.db.patch(playerId, patch)
				}

				// If game ended, also apply ELO for the last player
				if (remainingPlayers.length === 1) {
					const lastPlayerId = remainingPlayers[0] as Id<'users'>
					const lastElo = FOUR_PLAYER_ELO[newEliminated.length] ?? -30
					const lastPlayer = await ctx.db.get(lastPlayerId)
					if (lastPlayer) {
						const currentRating = lastPlayer.onlineRating ?? 1000
						await ctx.db.patch(lastPlayerId, {
							onlineRating: currentRating + lastElo,
							totalGamesPlayed: (lastPlayer.totalGamesPlayed || 0) + 1,
							currentWinStreak: 0,
						})
					}
				}
			} else if (isDraw) {
				updates.gameStatus = 'completed'
				updates.isDraw = true
				for (const pid of activePlayers) {
					const p = await ctx.db.get(pid)
					if (p) {
						await ctx.db.patch(pid, {
							totalGamesPlayed: (p.totalGamesPlayed || 0) + 1,
							currentWinStreak: 0,
						})
					}
				}
			} else {
				const playerIndex = game.userIds.indexOf(playerId)
				updates.currentTurn = getNextActivePlayer(game.userIds, playerIndex, eliminatedIds)
			}
		} else {
			// Original 2-player logic (AI / Online)
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
		}

		await ctx.db.patch(gameId, updates)

		// ELO for 2-player modes
		if (!isFourPlayer && (isWin || isDraw)) {
			const isAIGame = game.gameMode === 'AI'
			const allPlayers = await Promise.all(game.userIds.map(id => ctx.db.get(id)))

			if (isWin) {
				const winner = allPlayers.find(p => p?._id === playerId)
				if (winner && !winner.isAI) {
					const opponents = allPlayers.filter(p => p && p._id !== playerId)
					const avgOpponentRating =
						opponents.reduce((sum, p) => sum + (p ? getRating(p, isAIGame) : 1000), 0) /
						Math.max(opponents.length, 1)

					const winnerRating = getRating(winner, isAIGame)
					const { newWinnerRating } = calculateElo(winnerRating, avgOpponentRating)

					const newStreak = (winner.currentWinStreak ?? 0) + 1
					const patch: Record<string, unknown> = {
						totalGamesPlayed: (winner.totalGamesPlayed || 0) + 1,
						totalWins: (winner.totalWins || 0) + 1,
						currentWinStreak: newStreak,
						highestWinStreak: Math.max(newStreak, winner.highestWinStreak || 0),
					}
					patchRating(patch, isAIGame, newWinnerRating)
					await ctx.db.patch(winner._id, patch)
				}

				const losers = allPlayers.filter(p => p && p._id !== playerId && !p.isAI)
				for (const loser of losers) {
					if (!loser) continue
					const loserRating = getRating(loser, isAIGame)
					const winnerPlayer = allPlayers.find(p => p?._id === playerId)
					const winnerRat = winnerPlayer ? getRating(winnerPlayer, isAIGame) : 1000
					const { newLoserRating } = calculateElo(winnerRat, loserRating)
					const patch: Record<string, unknown> = {
						totalGamesPlayed: (loser.totalGamesPlayed || 0) + 1,
						currentWinStreak: 0,
					}
					patchRating(patch, isAIGame, newLoserRating)
					await ctx.db.patch(loser._id, patch)
				}
			} else if (isDraw) {
				const realPlayers = allPlayers.filter(p => p && !p.isAI)
				const avgRating =
					realPlayers.reduce((sum, p) => sum + (p ? getRating(p, isAIGame) : 1000), 0) /
					Math.max(realPlayers.length, 1)

				for (const player of realPlayers) {
					if (!player) continue
					const playerRating = getRating(player, isAIGame)
					const { newRating1 } = calculateEloDraw(playerRating, avgRating)
					const patch: Record<string, unknown> = {
						totalGamesPlayed: (player.totalGamesPlayed || 0) + 1,
						currentWinStreak: 0,
					}
					patchRating(patch, isAIGame, newRating1)
					await ctx.db.patch(player._id, patch)
				}
			}
		}

		// Trigger AI move if needed
		if (
			!isWin &&
			!isDraw &&
			game.gameMode === 'AI' &&
			updates.currentTurn === game.userIds[1]
		) {
			await ctx.scheduler.runAfter(1000, api.ai.ai_controller.aiMakeMove, {
				gameId,
				playerId: updates.currentTurn!,
			})
		}

		return {
			success: true,
			isWin,
			isDraw,
			nextTurn: updates.currentTurn,
			gameStatus: updates.gameStatus,
			moveMadeAt: updates.moveMadeAt,
		}
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
			v.literal('canceled'),
			v.literal('lost')
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

export const skipMove = mutation({
	args: {
		gameId: v.id('games'),
	},
	handler: async (ctx, { gameId }) => {
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

		if (game.gameStatus !== 'in_progress') {
			throw new Error('Game is not in progress')
		}

		if (game.currentTurn !== playerId) {
			throw new Error('It is not your turn to skip')
		}

		const playerIndex = game.userIds.indexOf(playerId)
		const nextPlayerIndex = (playerIndex + 1) % game.userIds.length
		const nextPlayerId = game.userIds[nextPlayerIndex]

		const updates: Partial<Doc<'games'>> = {
			currentTurn: nextPlayerId as Id<'users'>,
			updatedAt: new Date().toISOString(),
			moveMadeAt: new Date().toISOString(),
		}

		await ctx.db.patch(gameId, updates)

		if (game.gameMode === 'AI' && nextPlayerId === game.userIds[1]) {
			await ctx.scheduler.runAfter(1000, api.ai.ai_controller.aiMakeMove, {
				gameId,
				playerId: nextPlayerId as Id<'users'>,
			})
		}

		return { success: true, nextTurn: nextPlayerId }
	},
})

export const getCompletedGamesForUser = query({
	args: {
		userId: v.id('users'),
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, { userId, paginationOpts }) => {
		const results = await ctx.db
			.query('games')
			.withIndex('by_status', q => q.eq('gameStatus', 'completed'))
			.order('desc')
			.paginate(paginationOpts)

		const userGames = results.page.filter(g => g.userIds.includes(userId))

		const allUserIds = [...new Set(userGames.flatMap(g => g.userIds))]
		const users = await Promise.all(allUserIds.map(id => ctx.db.get(id)))
		const userMap: Record<string, { name: string; avatarUrl?: string }> = {}
		allUserIds.forEach((id, i) => {
			const u = users[i]
			if (u) {
				userMap[u._id] = { name: u.name || 'Unknown', avatarUrl: u.avatarUrl }
			} else {
				userMap[id] = { name: 'AI Player' }
			}
		})

		return {
			...results,
			page: userGames.map(g => ({
				_id: g._id,
				gameMode: g.gameMode,
				fieldSize: g.fieldSize,
				isDraw: g.isDraw,
				winnerId: g.winnerId,
				createdAt: g.createdAt,
				userIds: g.userIds,
				users: userMap,
			})),
		}
	},
})
