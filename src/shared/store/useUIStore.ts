import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface UIState {
	soundEnabled: boolean
	toggleSound: () => void
	theme: Theme
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
}

export const useUIStore = create<UIState>()(
	persist(
		(set) => ({
			soundEnabled: true,
			toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
			theme: 'dark' as Theme,
			setTheme: (theme: Theme) => set({ theme }),
			toggleTheme: () =>
				set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
		}),
		{ name: 'ttt-ui-settings' }
	)
)
