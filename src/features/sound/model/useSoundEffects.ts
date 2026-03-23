import { useCallback, useRef } from 'react'
import { useUIStore } from '@/shared/store/useUIStore'

const createOscillator = (
	ctx: AudioContext,
	frequency: number,
	duration: number,
	type: OscillatorType = 'sine'
) => {
	const osc = ctx.createOscillator()
	const gain = ctx.createGain()
	osc.type = type
	osc.frequency.setValueAtTime(frequency, ctx.currentTime)
	gain.gain.setValueAtTime(0.3, ctx.currentTime)
	gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
	osc.connect(gain)
	gain.connect(ctx.destination)
	osc.start()
	osc.stop(ctx.currentTime + duration)
}

export const useSoundEffects = () => {
	const soundEnabled = useUIStore(s => s.soundEnabled)
	const ctxRef = useRef<AudioContext | null>(null)

	const getCtx = useCallback(() => {
		if (!ctxRef.current) {
			ctxRef.current = new AudioContext()
		}
		return ctxRef.current
	}, [])

	const playMove = useCallback(() => {
		if (!soundEnabled) return
		const ctx = getCtx()
		createOscillator(ctx, 600, 0.1, 'sine')
	}, [soundEnabled, getCtx])

	const playWin = useCallback(() => {
		if (!soundEnabled) return
		const ctx = getCtx()
		createOscillator(ctx, 523, 0.15, 'sine')
		setTimeout(() => createOscillator(ctx, 659, 0.15, 'sine'), 150)
		setTimeout(() => createOscillator(ctx, 784, 0.3, 'sine'), 300)
	}, [soundEnabled, getCtx])

	const playDraw = useCallback(() => {
		if (!soundEnabled) return
		const ctx = getCtx()
		createOscillator(ctx, 440, 0.2, 'triangle')
		setTimeout(() => createOscillator(ctx, 380, 0.3, 'triangle'), 200)
	}, [soundEnabled, getCtx])

	const playClick = useCallback(() => {
		if (!soundEnabled) return
		const ctx = getCtx()
		createOscillator(ctx, 800, 0.05, 'square')
	}, [soundEnabled, getCtx])

	return { playMove, playWin, playDraw, playClick }
}
