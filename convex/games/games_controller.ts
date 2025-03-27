import { v } from 'convex/values'
import { Doc, Id } from '../_generated/dataModel'
import { mutation, query } from '../_generated/server'

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
	},
	handler: async (ctx, { userIds, gameMode, fieldSize, firstPlayerId }) => {
		console.log('Creating game with users:', userIds)
		const createdAt = new Date().toISOString()
		const updatedAt = createdAt

		const board = Array.from({ length: fieldSize }, () =>
			Array.from({ length: fieldSize }, () => ({
				symbol: '' as 'X' | 'O' | 'Square' | 'Triangle' | '',
				row: 0,
				col: 0,
			}))
		)

		const startingPlayerId = firstPlayerId || userIds[0]

		const userSymbols: Record<string, 'X' | 'O' | 'Square' | 'Triangle'> = {}
		const symbols: ('X' | 'O' | 'Square' | 'Triangle')[] = [
			'X',
			'O',
			'Square',
			'Triangle',
		]

		userIds.forEach((userId, index) => {
			userSymbols[userId] = symbols[index % symbols.length]
		})

		const game = await ctx.db.insert('games', {
			userIds,
			gameStatus: 'waiting',
			gameMode,
			fieldSize,
			isDraw: false,
			createdAt,
			updatedAt,
			board,
			currentTurn: startingPlayerId,
			userSymbols,
		})

		return game
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
		if (!game) {
			throw new Error('Game not found')
		}

		const updates: Partial<Doc<'games'>> = {
			gameStatus,
			updatedAt: new Date().toISOString(),
		}

		if (winnerId !== undefined) {
			updates.winnerId = winnerId
		}

		if (isDraw !== undefined) {
			updates.isDraw = isDraw
		}

		await ctx.db.patch(gameId, updates)

		if (gameStatus === 'in_progress') {
			const nextPlayerIndex =
				(game.userIds.indexOf(game.currentTurn!) + 1) % game.userIds.length
			await ctx.db.patch(gameId, {
				currentTurn: game.userIds[nextPlayerIndex] as Id<'users'>,
			})
		}

		return gameId
	},
})

// moves for game
const checkWinCondition = (
	board: {
		symbol: 'X' | 'O' | 'Square' | 'Triangle' | ''
		row: number
		col: number
	}[][],
	symbol: 'X' | 'O' | 'Square' | 'Triangle' | '',
	fieldSize: number
) => {
	// Check rows
	for (let i = 0; i < fieldSize; i++) {
		if (board[i].every(cell => cell.symbol === symbol)) return true
	}

	// Check columns
	for (let j = 0; j < fieldSize; j++) {
		if (board.every(row => row[j].symbol === symbol)) return true
	}

	// Check diagonals
	if (board.every((row, i) => row[i].symbol === symbol)) return true
	if (board.every((row, i) => row[fieldSize - 1 - i].symbol === symbol))
		return true

	return false
}

const isBoardFull = (
	board: {
		symbol: 'X' | 'O' | 'Square' | 'Triangle' | ''
		row: number
		col: number
	}[][]
) => {
	return board.every(row => row.every(cell => cell.symbol !== ''))
}

export const makeMove = mutation({
	args: {
		gameId: v.id('games'),
		row: v.number(),
		col: v.number(),
		symbol: v.union(
			v.literal('X'),
			v.literal('O'),
			v.literal('Square'),
			v.literal('Triangle')
		),
	},
	handler: async (ctx, { gameId, row, col, symbol }) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) throw new Error('Not authenticated')

		const user = await ctx.db
			.query('users')
			.withIndex('by_email', q => q.eq('email', identity.email))
			.unique()

		if (!user) throw new Error('User not found')
		const playerId = user._id

		const game = await ctx.db.get(gameId)
		if (!game) {
			throw new Error('Game not found')
		}

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

		// const createdAt = new Date().toISOString()
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
		}

		if (game.gameStatus === 'waiting') {
			updates.gameStatus = 'in_progress'
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

		if (isWin) {
			await ctx.db.patch(playerId, {
				totalGamesPlayed: (user.totalGamesPlayed || 0) + 1,
				totalWins: (user.totalWins || 0) + 1,
			})
		} else if (isDraw) {
			await ctx.db.patch(playerId, {
				totalGamesPlayed: (user.totalGamesPlayed || 0) + 1,
			})
		}

		return { success: true, isWin, isDraw }
	},
})

export const getMoves = query({
	args: { gameId: v.id('games') },
	handler: async (ctx, { gameId }) => {
		const game = await ctx.db.get(gameId)
		if (!game) return null
		return game.board
	},
})

export const getLastMove = query({
	args: { gameId: v.id('games') },
	handler: async (ctx, { gameId }) => {
		const game = await ctx.db.get(gameId)
		if (!game || game.board.every(row => row.every(cell => cell.symbol === '')))
			return null

		for (let i = game.board.length - 1; i >= 0; i--) {
			for (let j = game.board[i].length - 1; j >= 0; j--) {
				if (game.board[i][j].symbol !== '') {
					return game.board[i][j]
				}
			}
		}
		return null
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
