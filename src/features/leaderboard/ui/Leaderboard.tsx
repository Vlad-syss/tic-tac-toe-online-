import { Trophy } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/shared/ui/Button'

export function Leaderboard() {
	const navigate = useNavigate()

	return (
		<div className='flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-amber-50 dark:bg-amber-500/10 h-max rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 w-full'>
			<Trophy className='text-amber-600 dark:text-amber-400' size={48} />
			<h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-700 dark:text-amber-300'>Leaderboard</h2>
			<p className='text-lg text-amber-600 dark:text-amber-400'>Check out the best players!</p>

			<div className='space-y-4 mt-4 w-full'>
				<Button
					className='w-full bg-amber-600 text-white hover:bg-amber-700'
					variant='ghost'
					size='lg'
					onClick={() => navigate('/leaderboard/ai')}
				>
					AI Ratings
				</Button>
				<Button
					className='w-full bg-amber-600 text-white hover:bg-amber-700'
					variant='ghost'
					size='lg'
					onClick={() => navigate('/leaderboard/online')}
				>
					Online Ratings
				</Button>
			</div>
		</div>
	)
}
