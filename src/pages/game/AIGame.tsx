import { useEffect, useState } from 'react'
import { Id } from '../../../convex/_generated/dataModel'
import { useGame } from '../../hooks'
import { GameBoard } from '../../main/game'
import { Cell, GameState, GameUser, SymbolType } from '../../types'

export const AIGame = () => {
	const [gameId, setGameId] = useState<Id<'games'> | null>(null)
	const [gameState, setGameState] = useState<GameState | null>(null)
	const [cacheBuster, setCacheBuster] = useState(0)
	const { startNewGame, getGame, getMoves, makeMove, aiMakeMove, isLoading } =
		useGame(gameId)

	// Start a new game when component mounts
	useEffect(() => {
		startNewGame({ userIds: [], gameMode: 'AI', fieldSize: 3 }).then(id =>
			setGameId(id)
		)
	}, [startNewGame])

	// Update game state when data changes
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
			const players = getGame.userIds.map((userId, index) => ({
				user: {
					_id: userId,
					name: `Player ${index + 1}`,
				} as GameUser,
				symbol: (index === 0 ? 'X' : 'O') as SymbolType,
			}))

			setGameState({
				board: board2D,
				players,
				currentPlayerIndex,
				gameMode: getGame.gameMode,
				gameStatus: getGame.gameStatus,
				winner: getGame.winnerId,
				isDraw: getGame.isDraw,
				createdAt: getGame.createdAt,
				updatedAt: getGame.updatedAt,
				fieldSize: getGame.fieldSize,
			})
		}
	}, [getGame, getMoves])

	// Handle initial AI move for a new game
	useEffect(() => {
		if (
			gameState &&
			gameState.currentPlayerIndex === 1 &&
			gameState.gameStatus === 'waiting' &&
			gameState.players &&
			gameState.players[1] &&
			gameState.players[1].user &&
			gameId
		) {
			makeMove({
				gameId: gameId,
				playerId: gameState.players[1].user._id,
				row: 0,
				col: 0,
				symbol: 'O',
			})
		}
	}, [gameState, gameId, makeMove])

	// Handle AI moves during the game
	useEffect(() => {
		if (
			gameState &&
			gameState.currentPlayerIndex === 1 &&
			gameState.gameStatus === 'in_progress' &&
			!gameState.winner &&
			!gameState.isDraw &&
			gameState.players &&
			gameState.players[1] &&
			gameState.players[1].user &&
			gameId
		) {
			aiMakeMove({
				gameId: gameId,
				playerId: gameState.players[1].user._id,
				board: gameState.board,
				cacheBuster: Math.random(),
			})
			setCacheBuster(prev => prev + 1)
		}
	}, [gameState, aiMakeMove, gameId])

	// Handle player cell click
	const handleCellClick = (row: number, col: number) => {
		if (
			!gameState ||
			gameState.currentPlayerIndex !== 0 ||
			gameState.gameStatus !== 'in_progress' ||
			!gameId
		) {
			return
		}

		if (gameState?.players?.[0]?.user?._id && gameState?.board) {
			if (gameState.board[row]?.[col]?.symbol !== null) {
				return
			}

			makeMove({
				gameId: gameId as Id<'games'>,
				playerId: gameState.players[0].user._id,
				row,
				col,
				symbol: gameState.players[0].symbol,
			})
		}
	}

	if (isLoading || !gameState) {
		return <div>Loading...</div>
	}

	// Game status display
	let statusMessage = ''
	if (gameState.gameStatus === 'completed') {
		if (gameState.isDraw) {
			statusMessage = 'Game ended in a draw!'
		} else if (gameState.winner) {
			const winnerIndex = gameState.players.findIndex(
				p => p.user._id === gameState.winner
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
			<GameBoard board={gameState.board} onClick={handleCellClick} />{' '}
			{/* Pass the 2D board */}
			{gameState.gameStatus === 'completed' && (
				<button
					onClick={() => {
						startNewGame({ userIds: [], gameMode: 'AI', fieldSize: 3 }).then(
							id => setGameId(id)
						)
					}}
					className='new-game-button'
				>
					Start New Game
				</button>
			)}
		</div>
	)
}
