import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Id } from '../../convex/_generated/dataModel'
import { useGame, useUser } from '../hooks'
import { Cell, GameState, Move, SymbolType } from '../types'

interface UseTicTacToeGameProps {
	gameId: Id<'games'> | null
	setGameId: (gameId: Id<'games'> | null) => void
	fieldSize: number
	gameMode: 'AI' | 'Online' | '2v2' // Use the same type as in your mutation
}

export const useTicTacToeGame = ({
	gameId,
	setGameId,
	fieldSize,
	gameMode,
}: UseTicTacToeGameProps) => {
	const { user } = useUser()
	const [gameState, setGameState] = useState<GameState | null>(null)
	const [isCreatingGame, setIsCreatingGame] = useState(false)

	const {
		getGame,
		aiMakeMove,
		startGame,
		isLoading,
		deleteAi,
		startGameWithAI,
		makeMoves: makeMoveMutation,
	} = useGame(gameId)

	const startNewGameHandler = useCallback(async () => {
		if (!user?._id || isCreatingGame || gameMode !== 'AI') return null

		setIsCreatingGame(true)
		try {
			setGameState(null)
			setGameId(null)

			const newGameId = await startGameWithAI(user._id, fieldSize)

			setGameId(newGameId)
			toast.success('New game started!', {
				style: { background: '#4CAF50', color: '#fff' },
			})
			return newGameId
		} catch (error) {
			console.error('Error starting new game:', error)
			toast.error('Failed to start new game.', {
				style: { background: '#f44336', color: '#fff' },
			})
			return null
		} finally {
			setIsCreatingGame(false)
		}
	}, [user?._id, fieldSize, isCreatingGame, startGameWithAI, gameMode])

	useEffect(() => {
		if (
			gameState &&
			gameState.gameStatus === 'completed' &&
			gameMode === 'AI'
		) {
			if (gameState.userIds[1]) {
				deleteAi({ aiUserId: gameState.userIds[1] })
			}
		}
	}, [gameState?.gameStatus, gameState?.userIds, deleteAi, gameMode])

	useEffect(() => {
		if (!user?._id || gameId || isCreatingGame) return
		startNewGameHandler()
	}, [user?._id, gameId, isCreatingGame, startNewGameHandler])

	useEffect(() => {
		if (getGame) {
			const board2D: Cell[][] = getGame.board.map(row =>
				row.map(cell => ({
					row: cell.row,
					col: cell.col,
					symbol: cell.symbol as SymbolType | '',
				}))
			)

			const currentPlayerIndex =
				getGame.board.flat().filter(cell => cell.symbol !== '').length % 2

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
	}, [getGame])

	useEffect(() => {
		if (
			gameState &&
			gameState.currentPlayerIndex === 1 &&
			gameState.gameStatus === 'in_progress' &&
			gameId &&
			gameMode === 'AI'
		) {
			const aiUserId = gameState.userIds[1]

			if (!aiUserId) return

			aiMakeMove({
				gameId: gameId,
				playerId: aiUserId,
			})
		}
	}, [gameState, aiMakeMove, gameId, gameMode])

	useEffect(() => {
		return () => {
			if (gameId && gameState?.userIds[1] && gameMode === 'AI') {
				deleteAi({ aiUserId: gameState.userIds[1] })
			}
		}
	}, [gameId, gameState, deleteAi, gameMode])

	const handleCellClick = (row: number, col: number) => {
		if (
			!gameState ||
			gameState?.gameStatus !== 'in_progress' ||
			gameState?.currentPlayerIndex !== 0
		) {
			return
		}

		const playerId = gameState.userIds[gameState.currentPlayerIndex]
		if (!playerId || !gameId) return

		const symbol: SymbolType = gameState.currentPlayerIndex === 0 ? 'X' : 'O'
		makeMove({
			gameId,
			playerId,
			row,
			col,
			symbol,
			createdAt: new Date().toISOString(),
		})
	}

	const makeMove = (move: Move) => {
		if (!move.gameId) return
		if (move.symbol === 'Square' || move.symbol === 'Triangle') {
			return
		}

		makeMoveMutation({
			gameId: move.gameId,
			row: move.row,
			col: move.col,
			symbol: move.symbol,
		})
	}

	const checkWinner = () => {
		if (!gameState) return null
		if (gameState.gameStatus === 'completed') {
			if (gameState.isDraw) return 'Draw'
			if (gameState.winner) {
				const winnerIndex = gameState.userIds.findIndex(
					userId => userId === gameState.winner
				)
				return winnerIndex === 0 ? 'You' : gameMode === 'AI' ? 'AI' : 'Opponent'
			}
		}
		return null
	}

	return {
		gameState,
		isLoading,
		startNewGame: startNewGameHandler,
		handleCellClick,
		checkWinner,
	}
}
