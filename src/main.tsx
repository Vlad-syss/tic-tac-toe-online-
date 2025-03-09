import { Auth0Provider } from '@auth0/auth0-react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithAuth0 } from 'convex/react-auth0'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './main.css'
import { AuthLayout, AuthenticationGuard, Home } from './pages'
import { ProfilePage } from './pages/ProfilePage'
import { Login } from './pages/_components'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Auth0Provider
			domain={import.meta.env.VITE_AUTH0_DOMAIN as string}
			clientId={import.meta.env.VITE_AUTH0_CLIENTID as string}
			authorizationParams={{
				redirect_uri: 'http://localhost:5173/',
				audience: 'https://dev-qmpqldqi88ga64g2.us.auth0.com/api/v2/',
				scope: 'openid profile email',
			}}
			useRefreshTokens={true}
			cacheLocation='localstorage'
		>
			<ConvexProviderWithAuth0 client={convex}>
				<BrowserRouter>
					<Routes>
						<Route element={<AuthenticationGuard />}>
							<Route path='/' element={<Home />} />
							<Route path='/profile' element={<ProfilePage />} />
						</Route>

						<Route element={<AuthLayout />}>
							<Route path='login' element={<Login />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</ConvexProviderWithAuth0>
		</Auth0Provider>
	</StrictMode>
)
