import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { GameState } from '../types'
import { useUser } from './useUser'

interface UseGameStatusProps {
	gameState: GameState | null
	checkWinner: (
		gameState: GameState | null,
		isAI: boolean
	) => 'Draw' | 'You' | 'Opponent' | 'Lost' | null
	isAI: boolean
}

export const useGameStatus = ({
	gameState,
	checkWinner,
	isAI,
}: UseGameStatusProps) => {
	const [statusMessage, setStatusMessage] = useState('')
	const { user } = useUser()
	const gameEndedRef = useRef(false) // 🧠 Track if we already handled game end

	useEffect(() => {
		if (!gameState) {
			setStatusMessage('Waiting for game to start...')
			gameEndedRef.current = false
			return
		}

		const winner = checkWinner(gameState, isAI)
		console.log(winner)

		if (winner && !gameEndedRef.current) {
			gameEndedRef.current = true // ✅ Prevent multiple toasts

			let message
			if (winner === 'Draw') {
				message = 'Game ended in a draw!'
				toast.success(message, {
					style: { background: '#4CAF50', color: '#fff' },
				})
			} else if (winner === 'Lost') {
				message = 'You Lost the game!'
				toast.error(message, {
					style: { background: '#f44336', color: '#fff' },
				})
			} else {
				message = `${winner} won the game!`
				toast.success(message, {
					style: { background: '#4CAF50', color: '#fff' },
				})
			}
			setStatusMessage(message)
		} else if (!winner) {
			gameEndedRef.current = false // 🔄 Allow future games to show toast again

			if (gameState.currentTurn === user?._id) {
				setStatusMessage('Your turn')
			} else {
				setStatusMessage(isAI ? 'AI is thinking...' : 'Opponent turn')
			}
		}
	}, [gameState, isAI, user, checkWinner])

	return statusMessage
}
