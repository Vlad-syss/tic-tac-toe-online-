import { useEffect, useState } from 'react'

export const useTurnTimer = (turnEndTime: number, onTimeUp: () => void) => {
	const [timeLeft, setTimeLeft] = useState(turnEndTime - Date.now())

	useEffect(() => {
		const interval = setInterval(() => {
			const remaining = turnEndTime - Date.now()
			setTimeLeft(timeLeft)

			if (remaining <= 0) {
				clearInterval(interval)
				onTimeUp()
			}
		}, 1000)

		return () => clearInterval(interval)
	}, [turnEndTime, onTimeUp])

	return Math.max(0, Math.floor(timeLeft / 1000))
}
