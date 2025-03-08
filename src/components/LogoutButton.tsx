import { useAuth0 } from '@auth0/auth0-react'
import cn from 'classnames'
import { Loader, LogOut } from 'lucide-react'
import { Button } from './Button'

export const LogoutButton = ({
	id,
	className,
}: {
	id?: string
	className?: string
}) => {
	const { logout, isLoading } = useAuth0()

	return (
		<Button
			variant='greenLight'
			size='costum'
			className={cn('rounded-xl', className)}
			id={id}
			onClick={() =>
				logout({ logoutParams: { returnTo: 'http://localhost:5173/' } })
			}
			title='logout'
		>
			{!isLoading ? (
				<LogOut className='w-4 h-4' />
			) : (
				<Loader className='animate-spin w-4 h-4' />
			)}
		</Button>
	)
}
