import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { GameState } from '@/entities/game'
import { useSoundEffects } from '@/features/sound'
import { Id } from '../../../../convex/_generated/dataModel'

interface UseGameStatusProps {
	gameState: GameState | null
	checkWinner: () => 'You' | 'AI' | 'Opponent' | 'Draw' | null
	isAI: boolean
	currentUserId?: Id<'users'> | null
}

export const useGameStatus = ({
	gameState,
	checkWinner,
	isAI,
	currentUserId,
}: UseGameStatusProps) => {
	const [statusMessage, setStatusMessage] = useState('')
	const { playWin, playLose, playDraw } = useSoundEffects()
	const playedRef = useRef(false)

	useEffect(() => {
		if (!gameState) return

		const winner = checkWinner()
		if (winner) {
			const message =
				winner === 'Draw' ? 'Game ended in a draw!' : `${winner} won the game!`

			setStatusMessage(message)

			if (!playedRef.current) {
				playedRef.current = true
				const isLoss = winner === 'Opponent' || winner === 'AI'
				toast(message, {
					style: isLoss
						? { background: '#f44336', color: '#fff' }
						: { background: '#4CAF50', color: '#fff' },
					icon: isLoss ? '😞' : '🎉',
				})
				if (winner === 'Draw') playDraw()
				else if (isLoss) playLose()
				else playWin()
			}
		} else {
			playedRef.current = false

			if (gameState.gameMode === '1v1v1v1' && gameState.gameStatus === 'waiting') {
				setStatusMessage(`Waiting for players (${gameState.userIds.length}/4)...`)
			} else {
				const isMyTurn = currentUserId
					? gameState.currentTurn === currentUserId
					: gameState.currentPlayerIndex === 0

				const message = isMyTurn
					? 'Your turn'
					: isAI
						? 'AI is thinking...'
						: 'Opponent turn'

				setStatusMessage(message)
			}
		}
	}, [gameState, checkWinner, isAI, currentUserId, playWin, playLose, playDraw])

	return statusMessage
}
