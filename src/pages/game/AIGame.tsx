import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Id } from '../../../convex/_generated/dataModel'
import { useGame, useUser } from '../../hooks'
import { GameBoard } from '../../main/game'
import { Cell, GameState, SymbolType } from '../../types'

export const AIGame = () => {
	const { user } = useUser()
	const [gameId, setGameId] = useState<Id<'games'> | null>(null)
	const [gameState, setGameState] = useState<GameState | null>(null)
	const [isCreatingGame, setIsCreatingGame] = useState(false)

	const [searchParams] = useSearchParams()
	const size = searchParams.get('size')

	const fieldSize = size ? parseInt(size, 10) : 3

	const {
		getGame,
		getMoves,
		aiMakeMove,
		startGameWithAI,
		isLoading,
		deleteAi,
		makeMoves: makeMoveMutation,
	} = useGame(gameId)

	// Start a new game function
	const startNewGame = useCallback(async () => {
		if (!user?._id || isCreatingGame || size === null) return null
		console.log('startNewGame called')

		setIsCreatingGame(true)
		try {
			if (gameId && gameState?.userIds[1]) {
				await deleteAi({ aiUserId: gameState.userIds[1] })
			}

			setGameState(null)
			setGameId(null)

			// Create new game
			const newGameId = await startGameWithAI(user._id, fieldSize)
			setGameId(newGameId)
			return newGameId
		} catch (error) {
			console.error('Error starting new game:', error)
			return null
		} finally {
			setIsCreatingGame(false)
		}
	}, [
		user?._id,
		fieldSize,
		isCreatingGame,
		gameId,
		gameState,
		deleteAi,
		startGameWithAI,
	])

	// Initialize game on component mount
	useEffect(() => {
		if (!user?._id || gameId || isCreatingGame) return
		startNewGame()
	}, [user?._id, gameId, isCreatingGame, startNewGame])

	// Update game state when game data changes
	useEffect(() => {
		if (getGame && getMoves) {
			const board1D: (SymbolType | null)[] = Array(
				getGame.fieldSize * getGame.fieldSize
			).fill(null)

			getMoves.forEach(move => {
				board1D[move.row * getGame.fieldSize + move.col] =
					move.symbol as SymbolType
			})

			const board2D: Cell[][] = []
			for (let row = 0; row < getGame.fieldSize; row++) {
				const rowArray: Cell[] = []
				for (let col = 0; col < getGame.fieldSize; col++) {
					const index = row * getGame.fieldSize + col
					const symbol = board1D[index] ?? null
					rowArray.push({
						row,
						col,
						symbol,
					})
				}
				board2D.push(rowArray)
			}

			const currentPlayerIndex = getMoves.length % 2

			setGameState({
				board: board2D,
				userIds: getGame.userIds,
				currentPlayerIndex,
				gameMode: getGame.gameMode,
				gameStatus: getGame.gameStatus,
				winner: getGame.winnerId,
				isDraw: getGame.isDraw,
				createdAt: getGame.createdAt,
				updatedAt: getGame.updatedAt,
				fieldSize: getGame.fieldSize,
				players: getGame.userIds.map(id => ({ user: { _id: id } })),
			})
		}
	}, [getGame, getMoves])

	// Trigger AI move when it's AI's turn
	useEffect(() => {
		if (
			gameState &&
			gameState.currentPlayerIndex === 1 &&
			gameState.gameStatus === 'in_progress' &&
			gameId
		) {
			const aiUserId = gameState.userIds[1]
			if (!aiUserId) return

			// Use cache busting to ensure the query isn't cached
			aiMakeMove({
				gameId: gameId,
				playerId: aiUserId,
				board: gameState.board,
			})
		}
	}, [gameState, aiMakeMove, gameId])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (gameId && gameState?.userIds[1]) {
				deleteAi({ aiUserId: gameState.userIds[1] })
			}
		}
	}, [gameId, gameState, deleteAi])

	const handleCellClick = (row: number, col: number) => {
		console.log('Game status:', gameState?.gameStatus)
		console.log('Current player:', gameState?.currentPlayerIndex)
		console.log('Cell value:', gameState?.board[row][col])

		if (
			!gameState ||
			gameState.gameStatus !== 'in_progress' ||
			gameState.currentPlayerIndex !== 0 ||
			gameState.board[row][col]?.symbol !== null // Check the symbol property
		) {
			return
		}

		const playerId = gameState.userIds[0]
		if (!playerId) return

		const symbol: SymbolType = 'X'
		makeMove(row, col, symbol, playerId)
	}

	const makeMove = (
		row: number,
		col: number,
		symbol: SymbolType,
		playerId: Id<'users'>
	) => {
		if (!gameId) return
		if (symbol === 'Square' || symbol === 'Triangle') {
			return
		}

		makeMoveMutation({
			gameId: gameId,
			row,
			col,
			symbol,
		})
	}

	if (isLoading || !gameState) {
		return <div>Loading...</div>
	}

	let statusMessage = ''
	if (gameState.gameStatus === 'completed') {
		if (gameState.isDraw) {
			statusMessage = 'Game ended in a draw!'
		} else if (gameState.winner) {
			const winnerIndex = gameState.userIds.findIndex(
				userId => userId === gameState.winner
			)
			statusMessage = `${winnerIndex === 0 ? 'You' : 'AI'} won the game!`
		}
	} else {
		statusMessage =
			gameState.currentPlayerIndex === 0 ? 'Your turn' : 'AI is thinking...'
	}

	return (
		<div className='ai-game-container'>
			<h2>Tic-Tac-Toe vs AI</h2>
			<div className='game-status'>{statusMessage}</div>
			<GameBoard board={gameState.board} onClick={handleCellClick} />
			{gameState.gameStatus === 'completed' && (
				<button
					onClick={startNewGame}
					disabled={isCreatingGame}
					className='new-game-button'
				>
					{isCreatingGame ? 'Starting...' : 'Start New Game'}
				</button>
			)}
		</div>
	)
}
