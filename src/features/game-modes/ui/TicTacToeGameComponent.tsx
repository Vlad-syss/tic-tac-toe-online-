import { Copy } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router'
import { Id } from '../../../../convex/_generated/dataModel'
import { Button } from '@/shared/ui/Button'
import { Container } from '@/shared/ui/Container'
import {
	useAIGame,
	useFourPlayerGame,
	useGameApi,
	useOnlineGame,
	useGameStatus,
	GameBoard,
	ProfileBoard,
} from '@/features/game-board'
import { useUser } from '@/features/auth'
import { GameBoardSkeleton, ProfileBoardSkeleton } from '@/shared/ui/skeletons'
import { generateInviteCode } from '@/shared/lib/inviteCode'
import { useGameSettingsStore } from '@/shared/store/useGameSettingsStore'

interface TicTacToeGameComponentProps {
	gameMode: 'AI' | 'Online' | '1v1v1v1'
}

const StatusMessage = ({ message }: { message: string }) => (
	<AnimatePresence mode='wait'>
		<motion.div
			key={message}
			className='text-sm sm:text-xl mb-2 sm:mb-4 text-slate-600 dark:text-slate-300'
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 10 }}
			transition={{ duration: 0.2 }}
		>
			Status: {message}
		</motion.div>
	</AnimatePresence>
)

const AIGameInner = ({
	gameId,
	fieldSize,
}: {
	gameId: Id<'games'> | null
	fieldSize: number
}) => {
	const { gameState, isLoading, startGame, handleCellClick, checkWinner, timeLeft } =
		useAIGame(gameId, fieldSize)
	const { user } = useUser()
	const navigate = useNavigate()
	const statusMessage = useGameStatus({ gameState, checkWinner, isAI: true })

	const startNewGameWrapper = async () => {
		if (!user?._id) return
		const newId = await startGame(user._id as Id<'users'>)
		if (newId) {
			navigate(`/game/ai?size=${fieldSize}&gameId=${newId}`)
		}
	}

	if (isLoading) {
		return (
			<>
				<ProfileBoardSkeleton />
				<GameBoardSkeleton size={fieldSize} />
			</>
		)
	}
	if (!gameState) {
		return <p>Game is not found!</p>
	}

	return (
		<>
			<StatusMessage message={statusMessage} />
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
					className='mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded'
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
	const { user } = useUser()
	const navigate = useNavigate()
	const { startNewGame } = useGameApi(gameId)
	const { boardSize } = useGameSettingsStore()

	const handleRematch = async () => {
		if (!user || !gameState) return
		const code = generateInviteCode()
		const newGameId = await startNewGame({
			userIds: [user._id as Id<'users'>],
			gameMode: 'Online',
			fieldSize: boardSize || fieldSize,
			firstPlayerId: user._id as Id<'users'>,
			inviteCode: code,
		})
		if (newGameId) {
			navigate(`/game/online?size=${boardSize || fieldSize}&gameId=${newGameId}&invite=${code}`)
		}
	}

	if (isLoading) {
		return (
			<>
				<ProfileBoardSkeleton />
				<GameBoardSkeleton size={fieldSize} />
			</>
		)
	}
	if (!gameState) {
		return <p>Game is not found!</p>
	}

	return (
		<>
			<StatusMessage message={statusMessage} />
			{inviteCode && gameState.gameStatus === 'waiting' && (
				<div className='bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 rounded-lg p-4 mb-4 text-center w-full max-w-md'>
					<p className='text-sky-800 dark:text-sky-300 font-medium'>
						Share this link with your opponent:
					</p>
					<div className='flex items-center justify-center gap-2 mt-2'>
						<code className='bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm break-all'>
							{`${window.location.origin}/game/online?size=${fieldSize}&invite=${inviteCode}`}
						</code>
						<Button
							variant='ghost'
							size='sm'
							className='bg-sky-600 text-white hover:bg-sky-700 px-3 py-1'
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
					<p className='text-sky-600 dark:text-sky-400 text-sm mt-2'>
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
			{gameState.gameStatus === 'completed' && (
				<Button
					onClick={handleRematch}
					className='mt-6 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded'
				>
					Rematch
				</Button>
			)}
		</>
	)
}

const FourPlayerGameInner = ({
	gameId,
	fieldSize,
	inviteCode,
}: {
	gameId: Id<'games'> | null
	fieldSize: number
	inviteCode: string | null
}) => {
	const { gameState, isLoading, handleCellClick, checkWinner, timeLeft } =
		useFourPlayerGame(gameId, fieldSize)
	const statusMessage = useGameStatus({ gameState, checkWinner, isAI: false })
	const { user } = useUser()
	const navigate = useNavigate()
	const { startNewGame } = useGameApi(gameId)
	const { boardSize } = useGameSettingsStore()

	const handleRematch = async () => {
		if (!user || !gameState) return
		const code = generateInviteCode()
		const newGameId = await startNewGame({
			userIds: [user._id as Id<'users'>],
			gameMode: '1v1v1v1',
			fieldSize: boardSize || fieldSize,
			firstPlayerId: user._id as Id<'users'>,
			inviteCode: code,
		})
		if (newGameId) {
			navigate(`/game/1v1v1v1?size=${boardSize || fieldSize}&gameId=${newGameId}&invite=${code}`)
		}
	}

	if (isLoading) {
		return (
			<>
				<ProfileBoardSkeleton playerCount={4} />
				<GameBoardSkeleton size={fieldSize} />
			</>
		)
	}
	if (!gameState) {
		return <p>Game is not found!</p>
	}

	const isEliminated = user && gameState.eliminatedPlayers.some(ep => ep.userId === user._id)

	return (
		<>
			<StatusMessage message={statusMessage} />
			{inviteCode && gameState.gameStatus === 'waiting' && (
				<div className='bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 rounded-lg p-4 mb-4 text-center w-full max-w-md'>
					<p className='text-violet-800 dark:text-violet-300 font-medium'>
						Share this link with 3 opponents:
					</p>
					<div className='flex items-center justify-center gap-2 mt-2'>
						<code className='bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm break-all'>
							{`${window.location.origin}/game/1v1v1v1?size=${fieldSize}&invite=${inviteCode}`}
						</code>
						<Button
							variant='ghost'
							size='sm'
							className='bg-violet-600 text-white hover:bg-violet-700 px-3 py-1'
							onClick={() => {
								navigator.clipboard.writeText(
									`${window.location.origin}/game/1v1v1v1?size=${fieldSize}&invite=${inviteCode}`
								)
								toast.success('Link copied!')
							}}
						>
							<Copy className='w-4 h-4' />
						</Button>
					</div>
					<p className='text-violet-600 dark:text-violet-400 text-sm mt-2'>
						Waiting for players ({gameState.userIds.length}/4)...
					</p>
				</div>
			)}
			{gameState.eliminatedPlayers.length > 0 && gameState.gameStatus !== 'completed' && (
				<div className='flex flex-wrap gap-2 mb-3 w-full max-w-md justify-center'>
					{gameState.eliminatedPlayers.map(ep => (
						<span
							key={ep.userId}
							className='text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
						>
							#{ep.position} placed — {ep.eloChange >= 0 ? '+' : ''}{ep.eloChange} ELO
						</span>
					))}
				</div>
			)}
			{isEliminated && gameState.gameStatus !== 'completed' && (
				<div className='bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-3 mb-3 text-center w-full max-w-md'>
					<p className='text-amber-700 dark:text-amber-300 text-sm font-medium'>
						You finished! You can watch the remaining players or leave.
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
					eliminatedPlayers={gameState.eliminatedPlayers}
				/>
				<GameBoard board={gameState.board} onClick={handleCellClick} />
			</Container>
			{gameState.gameStatus === 'completed' && (
				<div className='flex flex-col items-center gap-3 mt-4'>
					<div className='flex flex-wrap gap-2 justify-center'>
						{gameState.eliminatedPlayers.map(ep => (
							<span
								key={ep.userId}
								className={`text-sm px-3 py-1.5 rounded-full font-semibold ${
									ep.position === 1
										? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
										: ep.position === 2
											? 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300'
											: ep.position === 3
												? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
												: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
								}`}
							>
								#{ep.position} — {ep.eloChange >= 0 ? '+' : ''}{ep.eloChange} ELO
							</span>
						))}
					</div>
					<Button
						onClick={handleRematch}
						className='bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-4 rounded'
					>
						Rematch
					</Button>
				</div>
			)}
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
	const [joinFailed, setJoinFailed] = useState(false)
	const isJoiningRef = useRef(false)

	useEffect(() => {
		const urlGameId = searchParams.get('gameId') as Id<'games'> | null
		if (urlGameId) {
			setGameId(urlGameId)
			return
		}
		if (inviteCode && user && !isJoiningRef.current && !joinFailed) {
			isJoiningRef.current = true
			setIsJoining(true)
			joinGameByInvite(inviteCode, user._id as Id<'users'>)
				.then(joinedGameId => {
					if (joinedGameId) setGameId(joinedGameId as Id<'games'>)
					setIsJoining(false)
				})
				.catch(() => {
					toast.error('Failed to join game. The invite may be expired.')
					setJoinFailed(true)
					setIsJoining(false)
				})
		}
	}, [searchParams, user, inviteCode, joinGameByInvite, joinFailed])

	const title =
		gameMode === 'AI'
			? 'Tic-Tac-Toe vs AI'
			: gameMode === 'Online'
				? 'Tic-Tac-Toe Online'
				: 'Tic-Tac-Toe 1v1v1v1'

	return (
		<div className='flex flex-col items-center justify-center p-2 sm:p-5 lg:p-8'>
			<Toaster position='top-center' />
			<h2 className='text-base sm:text-2xl lg:text-3xl font-semibold mb-3 sm:mb-6 text-slate-900 dark:text-white'>{title}</h2>

			{isJoining && (
				<>
					<ProfileBoardSkeleton />
					<GameBoardSkeleton size={fieldSize} />
				</>
			)}

			{joinFailed && (
				<div className='text-center'>
					<p className='text-red-500 dark:text-red-400 font-medium mb-4'>
						This invite link is no longer valid. The game may have already started or expired.
					</p>
					<Button
						onClick={() => navigate('/')}
						className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded'
					>
						Back to Home
					</Button>
				</div>
			)}

			{!isJoining && gameMode === 'AI' && (
				<AIGameInner
					gameId={gameId}
					fieldSize={fieldSize}
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
				<FourPlayerGameInner gameId={gameId} fieldSize={fieldSize} inviteCode={inviteCode} />
			)}
		</div>
	)
}
