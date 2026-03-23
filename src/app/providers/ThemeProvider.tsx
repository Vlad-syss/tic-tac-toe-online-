import { useEffect } from 'react'
import { useUIStore } from '@/shared/store/useUIStore'

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const theme = useUIStore((s) => s.theme)

	useEffect(() => {
		const root = document.documentElement
		if (theme === 'dark') {
			root.classList.add('dark')
		} else {
			root.classList.remove('dark')
		}
	}, [theme])

	return <>{children}</>
}
