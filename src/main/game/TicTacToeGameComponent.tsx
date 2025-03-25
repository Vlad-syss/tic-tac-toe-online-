import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useSearchParams } from 'react-router'
import { Id } from '../../../convex/_generated/dataModel'
import { Button } from '../../components/Button'
import { useGameStatus, useTicTacToeGame } from '../../hooks'
import { GameBoard, ProfileBoard } from '../../main/game'

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

	const { gameState, isLoading, startNewGame, handleCellClick, checkWinner } =
		useTicTacToeGame({ gameId, setGameId, fieldSize, gameMode })

	const statusMessage = useGameStatus({
		gameState,
		checkWinner,
		isAI: gameMode === 'AI',
	})

	if (isLoading || !gameState) {
		return <div>Loading...</div>
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
						: '2v2 Game'}
			</h2>
			<div className='text-xl mb-4 text-green-700'>{statusMessage}</div>
			<div className='max-w-[1000px] w-full mx-auto'>
				<ProfileBoard
					isAi={gameMode === 'AI'}
					userIds={gameState.userIds}
					userSymbols={gameState.userSymbols}
				/>
				<GameBoard board={gameState.board} onClick={handleCellClick} />
			</div>
			{gameState.gameStatus === 'completed' && (
				<Button
					onClick={startNewGame}
					disabled={isLoading}
					className='mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded'
				>
					{isLoading ? 'Starting...' : 'Start New Game'}
				</Button>
			)}
		</div>
	)
}
