import { useEffect, useRef, useState } from 'react'

export const useTurnTimer = ({
	currentTurnId,
	playerId,
	moveMadeAt,
	gameStatus,
	onTimeout,
	turnDuration = 30,
}: {
	currentTurnId: string | null | undefined
	playerId: string | null | undefined
	moveMadeAt: string | null | undefined
	gameStatus: string | undefined
	onTimeout: () => void
	turnDuration?: number
}) => {
	const [timeLeft, setTimeLeft] = useState(turnDuration)
	const timerRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		if (
			!moveMadeAt ||
			currentTurnId !== playerId ||
			gameStatus === 'completed' ||
			gameStatus === 'lost'
		) {
			if (timerRef.current) clearInterval(timerRef.current)
			return
		}

		const lastMoveTime = new Date(moveMadeAt).getTime()

		const updateTimeLeft = () => {
			const now = Date.now()
			const secondsPassed = Math.floor((now - lastMoveTime) / 1000)
			const remaining = Math.max(turnDuration - secondsPassed, 0)

			setTimeLeft(remaining)

			if (remaining === 0) {
				clearInterval(timerRef.current!)
				onTimeout()
			}
		}

		updateTimeLeft()

		if (timerRef.current) clearInterval(timerRef.current)
		timerRef.current = setInterval(updateTimeLeft, 1000)

		return () => {
			if (timerRef.current) clearInterval(timerRef.current)
		}
	}, [moveMadeAt, currentTurnId, gameStatus, playerId, turnDuration])

	return timeLeft
}
