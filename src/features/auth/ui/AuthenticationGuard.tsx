import { Navigate, Outlet } from 'react-router'
import { Container } from '@/shared/ui/Container'
import { useStoreUserEffect } from '@/features/auth'
import { Footer } from '@/shared/layouts/Footer'
import { Header } from '@/shared/layouts/Header'
import { AuthGuardSkeleton } from '@/shared/ui/skeletons'

export function AuthenticationGuard() {
	const { isAuthenticated, isLoading } = useStoreUserEffect()

	if (isLoading) {
		return <AuthGuardSkeleton />
	}

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />
	}

	return (
		<Container size='xl'>
			<Header />
			<Outlet />
			<Footer />
		</Container>
	)
}
