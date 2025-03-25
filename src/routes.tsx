import { Route, Routes } from 'react-router'
import {
	AuthLayout,
	AuthenticationGuard,
	GamePage,
	Home,
	ProfilePage,
} from './pages'
import { Login } from './pages/_components'
import { AIGame, OnevOnevOnevOneGame, OnlineGame } from './pages/game'

export const AppRoutes = () => (
	<Routes>
		<Route element={<AuthenticationGuard />}>
			<Route path='/' element={<Home />} />
			<Route path='*' element={<Home />} />
			<Route path='/profile' element={<ProfilePage />} />
			<Route path='/game' element={<GamePage />}>
				<Route path='ai' element={<AIGame />} />
				<Route path='online' element={<OnlineGame />} />
				<Route path='1v1v1v1' element={<OnevOnevOnevOneGame />} />
			</Route>
		</Route>

		<Route element={<AuthLayout />}>
			<Route path='login' element={<Login />} />
		</Route>
	</Routes>
)
