import { Copy, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useSearchParams } from 'react-router'
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

interface TicTacToeGameComponentProps {
	gameMode: 'AI' | 'Online' | '1v1v1v1'
}

// Inner components per game mode — each can call its hook unconditionally
const AIGameInner = ({
	gameId,
	fieldSize,
	onNewGame,
}: {
	gameId: Id<'games'> | null
	fieldSize: number
	onNewGame: (id: Id<'games'>) => void
}) => {
	const { gameState, isLoading, startGame, handleCellClick, checkWinner, timeLeft } =
		useAIGame(gameId, fieldSize)
	const { user } = useUser()
	const statusMessage = useGameStatus({ gameState, checkWinner, isAI: true })

	const startNewGameWrapper = async () => {
		if (!user?._id) return
		const newId = await startGame(user._id as Id<'users'>)
		if (newId) onNewGame(newId as Id<'games'>)
	}

	if (isLoading) {
		return <LoaderCircle className='animate-spin w-10 h-10' />
	}
	if (!gameState) {
		return <p>Game is not found!</p>
	}

	return (
		<>
			<div className='text-xl mb-4 text-green-700'>Status: {statusMessage}</div>
			<Container>
				<ProfileBoard
					isAi
					userIds={gameState.userIds}
					userSymbols={gameState.userSymbols}
					timeLeft={timeLeft}
					currentPlayerIndex={gameState.currentPlayerIndex}
				/>
				<GameBoard board={gameState.board} onClick={handleCellClick} />
			</Container>
			{gameState.gameStatus === 'completed' && (
				<Button
					onClick={startNewGameWrapper}
					className='mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded'
				>
					Start New Game
				</Button>
			)}
		</>
	)
}

const OnlineGameInner = ({
	gameId,
	fieldSize,
	inviteCode,
}: {
	gameId: Id<'games'> | null
	fieldSize: number
	inviteCode: string | null
}) => {
	const { gameState, isLoading, handleCellClick, checkWinner, timeLeft } =
		useOnlineGame(gameId, fieldSize)
	const statusMessage = useGameStatus({ gameState, checkWinner, isAI: false })

	if (isLoading) {
		return <LoaderCircle className='animate-spin w-10 h-10' />
	}
	if (!gameState) {
		return <p>Game is not found!</p>
	}

	return (
		<>
			<div className='text-xl mb-4 text-green-700'>Status: {statusMessage}</div>
			{inviteCode && gameState.gameStatus === 'waiting' && (
				<div className='bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4 text-center w-full max-w-md'>
					<p className='text-blue-800 font-medium'>
						Share this link with your opponent:
					</p>
					<div className='flex items-center justify-center gap-2 mt-2'>
						<code className='bg-white px-3 py-1 rounded border text-sm break-all'>
							{`${window.location.origin}/game/online?size=${fieldSize}&invite=${inviteCode}`}
						</code>
						<Button
							variant='costume'
							size='sm'
							className='bg-blue-500 text-white hover:bg-blue-600 px-3 py-1'
							onClick={() => {
								navigator.clipboard.writeText(
									`${window.location.origin}/game/online?size=${fieldSize}&invite=${inviteCode}`
								)
								toast.success('Link copied!')
							}}
						>
							<Copy className='w-4 h-4' />
						</Button>
					</div>
					<p className='text-blue-600 text-sm mt-2'>
						Waiting for opponent to join...
					</p>
				</div>
			)}
			<Container>
				<ProfileBoard
					isAi={false}
					userIds={gameState.userIds}
					userSymbols={gameState.userSymbols}
					timeLeft={timeLeft}
					currentPlayerIndex={gameState.currentPlayerIndex}
				/>
				<GameBoard board={gameState.board} onClick={handleCellClick} />
			</Container>
		</>
	)
}

const FourPlayerGameInner = ({
	gameId,
	fieldSize,
}: {
	gameId: Id<'games'> | null
	fieldSize: number
}) => {
	const { gameState, isLoading, handleCellClick, checkWinner, timeLeft } =
		useFourPlayerGame(gameId, fieldSize)
	const statusMessage = useGameStatus({ gameState, checkWinner, isAI: false })

	if (isLoading) {
		return <LoaderCircle className='animate-spin w-10 h-10' />
	}
	if (!gameState) {
		return <p>Game is not found!</p>
	}

	return (
		<>
			<div className='text-xl mb-4 text-green-700'>Status: {statusMessage}</div>
			<Container>
				<ProfileBoard
					isAi={false}
					userIds={gameState.userIds}
					userSymbols={gameState.userSymbols}
					timeLeft={timeLeft}
					currentPlayerIndex={gameState.currentPlayerIndex}
				/>
				<GameBoard board={gameState.board} onClick={handleCellClick} />
			</Container>
		</>
	)
}

export const TicTacToeGameComponent = ({
	gameMode,
}: TicTacToeGameComponentProps) => {
	const [gameId, setGameId] = useState<Id<'games'> | null>(null)
	const [searchParams] = useSearchParams()
	const size = searchParams.get('size')
	const fieldSize = size ? parseInt(size, 10) : 3
	const { user } = useUser()

	const inviteCode = searchParams.get('invite')
	const { joinGameByInvite } = useGameApi(gameId)
	const [isJoining, setIsJoining] = useState(false)

	useEffect(() => {
		const urlGameId = searchParams.get('gameId') as Id<'games'> | null
		if (urlGameId) {
			setGameId(urlGameId)
			return
		}
		if (inviteCode && user && !isJoining) {
			setIsJoining(true)
			joinGameByInvite(inviteCode, user._id as Id<'users'>)
				.then(joinedGameId => {
					if (joinedGameId) setGameId(joinedGameId as Id<'games'>)
				})
				.catch(err => {
					console.error('Failed to join game:', err)
					toast.error('Failed to join game. The invite may be expired.')
				})
				.finally(() => setIsJoining(false))
		}
	}, [searchParams, user])

	const title =
		gameMode === 'AI'
			? 'Tic-Tac-Toe vs AI'
			: gameMode === 'Online'
				? 'Tic-Tac-Toe Online'
				: 'Tic-Tac-Toe 1v1v1v1'

	return (
		<div className='flex flex-col items-center justify-center p-8'>
			<Toaster position='top-center' />
			<h2 className='text-3xl font-semibold mb-6 text-green-800'>{title}</h2>

			{isJoining && <LoaderCircle className='animate-spin w-10 h-10' />}

			{!isJoining && gameMode === 'AI' && (
				<AIGameInner
					gameId={gameId}
					fieldSize={fieldSize}
					onNewGame={setGameId}
				/>
			)}
			{!isJoining && gameMode === 'Online' && (
				<OnlineGameInner
					gameId={gameId}
					fieldSize={fieldSize}
					inviteCode={inviteCode}
				/>
			)}
			{!isJoining && gameMode === '1v1v1v1' && (
				<FourPlayerGameInner gameId={gameId} fieldSize={fieldSize} />
			)}
		</div>
	)
}
