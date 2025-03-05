import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'

export const { auth, isAuthenticated, signIn, signOut, store } = convexAuth({
	providers: [Password],
})
