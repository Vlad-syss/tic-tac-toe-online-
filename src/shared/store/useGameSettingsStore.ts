import { create } from 'zustand'

interface GameSettingsState {
	boardSize: number
	setBoardSize: (size: number) => void
}

export const useGameSettingsStore = create<GameSettingsState>((set) => ({
	boardSize: 3,
	setBoardSize: (size) => set({ boardSize: size }),
}))
