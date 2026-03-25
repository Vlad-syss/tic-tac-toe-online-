import { BrowserRouter } from 'react-router'
import { AuthProvider } from './providers/AuthProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { AppRouter } from './router/AppRouter'

export const App = () => {
	return (
		<ThemeProvider>
			<AuthProvider>
				<BrowserRouter>
					<AppRouter />
				</BrowserRouter>
			</AuthProvider>
		</ThemeProvider>
	)
}
