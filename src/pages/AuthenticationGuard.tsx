import { Loader2 } from 'lucide-react'
import { Navigate, Outlet } from 'react-router'
import { Container } from '../components/Container'
import { useStoreUserEffect } from '../hooks'
import { Footer, Header } from './_components'

export function AuthenticationGuard() {
	const { isAuthenticated, isLoading } = useStoreUserEffect()

	if (isLoading) {
		return (
			<Container>
				<div className='w-full h-full flex items-center justify-center'>
					<Loader2 className='animate-spin' />
				</div>
			</Container>
		)
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
