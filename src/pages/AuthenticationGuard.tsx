import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, Outlet } from 'react-router'
import { Container } from '../components/Container'
import { Footer } from './_components/Footer'
import { Header } from './_components/Header'

export function AuthenticationGuard() {
	const { isAuthenticated, isLoading } = useAuth0()

	if (isLoading) {
		return <Container>Loading...</Container>
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
