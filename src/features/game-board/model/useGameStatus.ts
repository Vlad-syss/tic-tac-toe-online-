import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { GameState } from '@/entities/game'
import { useSoundEffects } from '@/features/sound'

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
	const { playWin, playDraw } = useSoundEffects()
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
				toast.success(message, {
					style: { background: '#4CAF50', color: '#fff' },
				})
				if (winner === 'Draw') playDraw()
				else playWin()
			}
		} else {
			playedRef.current = false

			if (gameState.gameMode === '1v1v1v1' && gameState.gameStatus === 'waiting') {
				setStatusMessage(`Waiting for players (${gameState.userIds.length}/4)...`)
			} else {
				const message =
					gameState.currentPlayerIndex === 0
						? 'Your turn'
						: isAI
							? 'AI is thinking...'
							: 'Opponent turn'

				setStatusMessage(message)
			}
		}
	}, [gameState, checkWinner, isAI, playWin, playDraw])

	return statusMessage
}
