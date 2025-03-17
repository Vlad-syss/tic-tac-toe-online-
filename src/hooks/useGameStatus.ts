import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { GameState } from '../types'

interface UseGameStatusProps {
	gameState: GameState | null
	checkWinner: () => 'You' | 'AI' | 'Opponent' | 'Draw' | null
	isAI: boolean
}

export const useGameStatus = ({
	gameState,
	checkWinner,
	isAI,
}: UseGameStatusProps) => {
	const [statusMessage, setStatusMessage] = useState('')

	useEffect(() => {
		if (!gameState) return

		if (checkWinner()) {
			const winner = checkWinner()
			const message =
				winner === 'Draw' ? 'Game ended in a draw!' : `${winner} won the game!`

			setStatusMessage(message)
			toast.success(message, {
				style: { background: '#4CAF50', color: '#fff' },
			})
		} else {
			const message =
				gameState.currentPlayerIndex === 0
					? 'Your turn'
					: isAI
						? 'AI is thinking...'
						: 'Opponent turn'

			setStatusMessage(message)
		}
	}, [gameState, checkWinner, isAI])

	return statusMessage
}
