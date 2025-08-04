import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router'
import { Id } from '../../../convex/_generated/dataModel'
import { Button } from '../../components/Button'
import { Container } from '../../components/Container'
import {
	useAIGame,
	useFourPlayerGame,
	useGameApi,
	useOnlineGame,
	useUser,
} from '../../hooks'
import { useGameStatus } from '../../hooks/useGameStatus'
import { GameBoard, ProfileBoard } from '../../main/game'
import { startGame } from '../../utils/gameUtils'

interface TicTacToeGameComponentProps {
	gameMode: 'AI' | 'Online' | '1v1v1v1'
}

export const TicTacToeGameComponent = ({
	gameMode,
}: TicTacToeGameComponentProps) => {
	const [gameId, setGameId] = useState<Id<'games'> | null>(null)
	const [searchParams] = useSearchParams()
	const size = searchParams.get('size')
	const fieldSize = size ? parseInt(size, 10) : 3
	const navigate = useNavigate()
	const { startGameWithAI } = useGameApi(gameId)
	const { aiTimeLeft } = useAIGame(gameId, fieldSize)
	const { user } = useUser()

	let gameHook

	switch (gameMode) {
		case 'AI':
			gameHook = useAIGame(gameId, fieldSize)
			break
		case 'Online':
			gameHook = useOnlineGame(gameId, fieldSize)
			break
		case '1v1v1v1':
			gameHook = useFourPlayerGame(gameId, fieldSize)
			break
		default:
			return <div>Invalid game mode</div>
	}

	const { gameState, isLoading, handleCellClick, checkWinner, timeLeft } =
		gameHook

	const statusMessage = useGameStatus({
		gameState,
		checkWinner,
		isAI: gameMode === 'AI',
	})

	useEffect(() => {
		const urlGameId = searchParams.get('gameId') as Id<'games'> | null
		if (urlGameId) {
			setGameId(urlGameId)
		}
	}, [searchParams])

	const handleCellClickWrapper = (r: number, c: number) => {
		handleCellClick(r, c)
	}
	const startNewGameWrapper = (boardSize: number) => {
		// Pass the required functions and data to your helper
		if (gameMode === 'AI' && user && user._id) {
			console.log('start')

			startGame(gameMode, boardSize, startGameWithAI, user, navigate)
		} else {
		}
	}

	if (isLoading) {
		return <LoaderCircle className='animate-spin w-10 h-10' />
	}

	if (!gameState) {
		return <p>Game is not found!</p>
	}

	return (
		<div className='flex flex-col items-center justify-center p-8 '>
			<Toaster position='top-center' />
			<h2 className='text-3xl font-semibold mb-6 text-green-800'>
				Tic-Tac-Toe{' '}
				{gameMode === 'AI'
					? 'vs AI'
					: gameMode === 'Online'
						? 'Online Game'
						: '1v1v1v1 Game'}
			</h2>
			<div className='text-xl mb-4 text-green-700'>Status: {statusMessage}</div>
			<Container>
				<ProfileBoard
					isAi={gameMode === 'AI'}
					userIds={gameState.userIds}
					userSymbols={gameState.userSymbols}
					timeLeft={timeLeft}
					aiTimeLeft={aiTimeLeft}
					currentPlayerIndex={gameState?.currentTurn}
				/>
				<GameBoard board={gameState.board} onClick={handleCellClickWrapper} />
			</Container>
			{(gameState.gameStatus === 'completed' ||
				gameState.gameStatus === 'lost') && (
				<Button
					onClick={() => startNewGameWrapper(fieldSize)}
					disabled={isLoading}
					className='mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded'
				>
					{isLoading ? 'Starting...' : 'Start New Game'}
				</Button>
			)}
		</div>
	)
}
