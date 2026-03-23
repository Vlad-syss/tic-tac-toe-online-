import { Auth0Provider } from '@auth0/auth0-react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithAuth0 } from 'convex/react-auth0'
import { ReactNode } from 'react'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	return (
		<Auth0Provider
			domain={import.meta.env.VITE_AUTH0_DOMAIN as string}
			clientId={import.meta.env.VITE_AUTH0_CLIENTID as string}
			authorizationParams={{
				redirect_uri: window.location.origin,
				audience: 'https://dev-qmpqldqi88ga64g2.us.auth0.com/api/v2/',
				scope: 'openid profile email',
			}}
			useRefreshTokens={true}
			cacheLocation='localstorage'
		>
			<ConvexProviderWithAuth0 client={convex}>
				{children}
			</ConvexProviderWithAuth0>
		</Auth0Provider>
	)
}
