import { Route, Routes } from 'react-router'
import { AuthenticationGuard } from '@/features/auth'
import { Home } from '@/pages/home/HomePage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { LeaderboardPage } from '@/pages/leaderboard/LeaderboardPage'
import { GamePage } from '@/pages/game/GameLayout'
import { AIGame } from '@/pages/game/AIGamePage'
import { OnlineGame } from '@/pages/game/OnlineGamePage'
import { OnevOnevOnevOneGame } from '@/pages/game/FourPlayerGamePage'
import { AuthLayout } from '@/pages/login/AuthLayout'
import { Login } from '@/pages/login/LoginPage'
import { GameHistoryPage } from '@/pages/history/GameHistoryPage'
import { HowToPlayPage } from '@/pages/how-to-play/HowToPlayPage'

export const AppRouter = () => (
	<Routes>
		<Route element={<AuthenticationGuard />}>
			<Route path='/' element={<Home />} />
			<Route path='*' element={<Home />} />
			<Route path='/how-to-play' element={<HowToPlayPage />} />
			<Route path='/profile' element={<ProfilePage />} />
			<Route path='/history' element={<GameHistoryPage />} />
			<Route path='/leaderboard/:type' element={<LeaderboardPage />} />
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
