import { Outlet } from 'react-router'
import { Logo } from '../components/Logo'
import { MainTitle } from '../components/MainTitle'

export function AuthLayout() {
	return (
		<main className='flex flex-col w-full h-full pt-30 items-center px-2 gap-3'>
			<article className='flex  justify-center items-center gap-4'>
				<MainTitle fontSize='xl' />
				<span className='text-6xl'> | </span>
				<Logo size={150} />
			</article>

			<Outlet />
		</main>
	)
}
