import { Route, Routes } from 'react-router'
import {
	AuthLayout,
	AuthenticationGuard,
	GamePage,
	Home,
	ProfilePage,
} from './pages'
import { Login } from './pages/_components'
import { AIGame, OnlineGame, TwovTwoGame } from './pages/game'

export const AppRoutes = () => (
	<Routes>
		<Route element={<AuthenticationGuard />}>
			<Route path='/' element={<Home />} />
			<Route path='*' element={<Home />} />
			<Route path='/profile' element={<ProfilePage />} />
			<Route path='/game' element={<GamePage />}>
				<Route path='ai' element={<AIGame />} />
				<Route path='online' element={<OnlineGame />} />
				<Route path='2v2' element={<TwovTwoGame />} />
			</Route>
		</Route>

		<Route element={<AuthLayout />}>
			<Route path='login' element={<Login />} />
		</Route>
	</Routes>
)
