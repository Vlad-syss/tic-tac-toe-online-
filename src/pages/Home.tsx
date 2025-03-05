import { useAuth0 } from '@auth0/auth0-react'

export function Home() {
	const { user } = useAuth0()

	return (
		<div className='flex-[1_0_auto]'>
			<p>Hello {user !== undefined && user.name}</p>
		</div>
	)
}
