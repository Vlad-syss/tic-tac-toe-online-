import { Logo } from '../../components/Logo'
import { MainTitle } from '../../components/MainTitle'
import { Profile } from '../../components/Profile'

export const Header = () => {
	return (
		<header className='flex items-center py-2 justify-between border-b-2'>
			<a href='' className='flex items-center gap-1'>
				<Logo size={65} />
				<MainTitle />
			</a>
			<div className='flex items-center gap-2'>
				<Profile />
			</div>
		</header>
	)
}
