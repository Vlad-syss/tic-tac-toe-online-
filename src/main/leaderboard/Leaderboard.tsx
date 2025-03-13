import { Trophy } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'

export function Leaderboard() {
	const navigate = useNavigate()

	return (
		<div className='flex flex-col items-center p-8 bg-yellow-100 h-max rounded-lg shadow-lg w-full'>
			<Trophy className='text-yellow-600' size={48} />
			<h2 className='text-4xl font-bold text-yellow-800'>Leaderboard</h2>
			<p className='text-lg text-yellow-700'>Check out the best players!</p>

			<div className='space-y-4 mt-4 w-full'>
				<Button
					className='w-full bg-yellow-600 text-yellow-800 hover:bg-yellow-600/80'
					variant='costume'
					size='lg'
					onClick={() => navigate('/leaderboard/ai')}
				>
					AI Rankings
				</Button>
				<Button
					className='w-full bg-yellow-600 text-yellow-800 hover:bg-yellow-600/80'
					variant='costume'
					size='lg'
					onClick={() => navigate('/leaderboard/online')}
				>
					Online Rankings
				</Button>
			</div>
		</div>
	)
}
