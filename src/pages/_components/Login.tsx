import { useAuth0 } from '@auth0/auth0-react'
import { useConvexAuth } from 'convex/react'
import { Loader, LogIn } from 'lucide-react'
import { Button } from '../../components/Button'

export const Login = () => {
	const { loginWithRedirect } = useAuth0()
	const { isLoading } = useConvexAuth()

	return (
		<div className='grid gap-10'>
			<h2 className='tracking-wide text-lg text-center'>
				Hmmmm... its seems like you dont authorize yet. <br />
				<span className='text-green-800 font-bold text-2xl'>
					Do you want to join us?)
				</span>
			</h2>
			<Button
				variant='greenDark'
				className='flex items-center gap-2'
				onClick={() => loginWithRedirect()}
			>
				{!isLoading ? (
					<>
						<span className='tracking-wider'>Login</span> <LogIn />
					</>
				) : (
					<Loader className='animate-spin' />
				)}
			</Button>
		</div>
	)
}
