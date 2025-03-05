import { useAuth0 } from '@auth0/auth0-react'
import { Logo } from '../../components/Logo'
import { MainTitle } from '../../components/MainTitle'

export const Header = () => {
	const { user } = useAuth0()

	return (
		<header className='flex items-center py-2 justify-between border-b-2'>
			<a href='' className='flex items-center gap-1'>
				<Logo size={65} />
				<MainTitle />
			</a>
			<div className='flex gap-1'>
				<img
					src={user?.picture}
					width={50}
					height={50}
					alt='profile_img'
					className='rounded'
				/>
				<div className=''>
					<h4>{user?.nickname ? user.nickname : user?.name}</h4>
					<p>{user?.email}</p>
				</div>
			</div>
		</header>
	)
}
