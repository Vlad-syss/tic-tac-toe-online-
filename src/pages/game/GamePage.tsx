import { Outlet } from 'react-router'

export const GamePage = () => {
	return (
		<div className='flex-[1_0_auto]'>
			<Outlet />
		</div>
	)
}
