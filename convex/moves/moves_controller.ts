import { v } from 'convex/values'
import { Doc, Id } from '../_generated/dataModel'
import { mutation, query } from '../_generated/server'

// Helper function to check if a player has won
const checkWinCondition = (
	board: Array<Array<string | null>>,
	fieldSize: number,
	symbol: string
) => {
	// Check rows
	for (let i = 0; i < fieldSize; i++) {
		let rowWin = true
		for (let j = 0; j < fieldSize; j++) {
			if (board[i][j] !== symbol) {
				rowWin = false
				break
			}
		}
		if (rowWin) return true
	}

	// Check columns
	for (let j = 0; j < fieldSize; j++) {
		let colWin = true
		for (let i = 0; i < fieldSize; i++) {
			if (board[i][j] !== symbol) {
				colWin = false
				break
			}
		}
		if (colWin) return true
	}

	// Check diagonals
	let diag1Win = true
	let diag2Win = true
	for (let i = 0; i < fieldSize; i++) {
		if (board[i][i] !== symbol) {
			diag1Win = false
		}
		if (board[i][fieldSize - 1 - i] !== symbol) {
			diag2Win = false
		}
	}
	return diag1Win || diag2Win
}

// Helper function to check if the board is full (draw condition)
const isBoardFull = (board: Array<Array<string | null>>) => {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board[i].length; j++) {
			if (board[i][j] === null) {
				return false
			}
		}
	}
	return true
}

// Function to build the current board state from moves
const buildBoardFromMoves = (moves: Doc<'moves'>[], fieldSize: number) => {
	const board: Array<Array<string | null>> = Array(fieldSize)
		.fill(null)
		.map(() => Array(fieldSize).fill(null))

	for (const move of moves) {
		board[move.row][move.col] = move.symbol
	}

	return board
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
		// Get the current user's identity
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new Error('Not authenticated')
		}

		// Get the user from the database
		const user = await ctx.db
			.query('users')
			.withIndex('by_email', q => q.eq('email', identity.email))
			.unique()

		if (!user) {
			throw new Error('User not found')
		}

		const playerId = user._id

		// Get the game
		const game = await ctx.db.get(gameId)
		if (!game) {
			throw new Error('Game not found')
		}

		// Check if game is active
		if (game.gameStatus !== 'waiting' && game.gameStatus !== 'in_progress') {
			throw new Error('Game is not active')
		}
		const moves = await ctx.db
			.query('moves')
			.withIndex('by_game', q => q.eq('gameId', gameId))
			.collect()

		// Check if it's the player's turn
		const expectedPlayerId = game.userIds[moves.length % 2]
		if (playerId !== expectedPlayerId) {
			throw new Error('Not your turn')
		}

		// Check if player is part of this game
		if (!game.userIds.includes(playerId)) {
			throw new Error('You are not part of this game')
		}

		// Get existing moves
		const existingMoves = await ctx.db
			.query('moves')
			.withIndex('by_game', q => q.eq('gameId', gameId))
			.collect()

		// Check if the cell is already occupied
		const isOccupied = existingMoves.some(
			move => move.row === row && move.col === col
		)
		if (isOccupied) {
			throw new Error('This cell is already occupied')
		}

		// Validate move is within bounds
		if (row < 0 || row >= game.fieldSize || col < 0 || col >= game.fieldSize) {
			throw new Error('Move is out of bounds')
		}

		const createdAt = new Date().toISOString()

		// Insert the new move
		await ctx.db.insert('moves', {
			gameId,
			playerId,
			row,
			col,
			symbol,
			createdAt,
		})

		// Update game status if it was waiting
		if (game.gameStatus === 'waiting') {
			await ctx.db.patch(gameId, {
				gameStatus: 'in_progress',
				updatedAt: createdAt,
				currentTurn: playerId,
			})
		}

		// Build the current board state
		const fieldSize = game.fieldSize
		const board = buildBoardFromMoves(
			[
				...existingMoves,
				{
					row,
					col,
					symbol,
					gameId,
					playerId,
					createdAt,
					_id: '' as Id<'moves'>,
					_creationTime: 0,
				},
			],
			fieldSize
		)

		// Check for win or draw
		const isWin = checkWinCondition(board, fieldSize, symbol)
		const isDraw = !isWin && isBoardFull(board)

		// Update game status based on win/draw
		if (isWin) {
			await ctx.db.patch(gameId, {
				gameStatus: 'completed',
				winnerId: playerId,
				isDraw: false,
				updatedAt: createdAt,
			})

			// Update player stats
			await ctx.db.patch(playerId, {
				totalGamesPlayed: (user.totalGamesPlayed || 0) + 1,
				totalWins: (user.totalWins || 0) + 1,
			})
		} else if (isDraw) {
			await ctx.db.patch(gameId, {
				gameStatus: 'completed',
				isDraw: true,
				updatedAt: createdAt,
			})

			// Update player stats for draw
			await ctx.db.patch(playerId, {
				totalGamesPlayed: (user.totalGamesPlayed || 0) + 1,
			})
		} else {
			// Set next player's turn
			const playerIndex = game.userIds.indexOf(playerId)
			const nextPlayerIndex = (playerIndex + 1) % game.userIds.length
			const nextPlayerId = game.userIds[nextPlayerIndex]

			await ctx.db.patch(gameId, {
				currentTurn: nextPlayerId,
				updatedAt: createdAt,
			})
		}

		return { success: true, isWin, isDraw }
	},
})

export const getMoves = query({
	args: {
		gameId: v.id('games'),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('moves')
			.withIndex('by_game', q => q.eq('gameId', args.gameId))
			.collect()
	},
})

export const getLastMove = query({
	args: {
		gameId: v.id('games'),
	},
	handler: async (ctx, args) => {
		const moves = await ctx.db
			.query('moves')
			.withIndex('by_game', q => q.eq('gameId', args.gameId))
			.collect()

		if (moves.length === 0) return null

		// Sort by creation time to get the most recent move
		moves.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)
		return moves[0]
	},
})

export const getCurrentBoardState = query({
	args: {
		gameId: v.id('games'),
	},
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.gameId)
		if (!game) {
			throw new Error('Game not found')
		}

		const moves = await ctx.db
			.query('moves')
			.withIndex('by_game', q => q.eq('gameId', args.gameId))
			.collect()

		const fieldSize = game.fieldSize
		const board = buildBoardFromMoves(moves, fieldSize)

		return {
			board,
			gameStatus: game.gameStatus,
			currentTurn: game.currentTurn,
			isDraw: game.isDraw,
			winnerId: game.winnerId,
		}
	},
})
