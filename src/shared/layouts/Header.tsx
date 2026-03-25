import { AnimatePresence, motion } from 'motion/react'
import { HelpCircle, Moon, Sun, Volume2, VolumeX } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Logo } from '@/shared/ui/Logo'
import { MainTitle } from '@/shared/ui/MainTitle'
import { Profile } from '@/shared/ui/Profile'
import { Button } from '@/shared/ui/Button'
import { useUIStore } from '@/shared/store/useUIStore'

export const Header = () => {
	const { soundEnabled, toggleSound, theme, toggleTheme } = useUIStore()
	const navigate = useNavigate()

	return (
		<header className='flex items-center py-1.5 sm:py-2 justify-between border-b border-slate-200 dark:border-slate-800'>
			<a href='/' className='flex items-center gap-1'>
				<span className='sm:hidden'><Logo size={40} /></span>
				<span className='hidden sm:block'><Logo size={65} /></span>
				<span className='hidden sm:block'>
					<MainTitle />
				</span>
			</a>
			<div className='flex items-center gap-1 sm:gap-2'>
				<Button
					variant='outline'
					size='custom'
					className='h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-md border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
					onClick={() => navigate('/how-to-play')}
				>
					<HelpCircle className='w-4 h-4 text-indigo-600 dark:text-indigo-400' />
				</Button>
				<Button
					variant='outline'
					size='custom'
					className='h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-md border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer overflow-hidden'
					onClick={toggleTheme}
				>
					<AnimatePresence mode='wait' initial={false}>
						{theme === 'dark' ? (
							<motion.div
								key='sun'
								initial={{ y: -20, opacity: 0, rotate: -90 }}
								animate={{ y: 0, opacity: 1, rotate: 0 }}
								exit={{ y: 20, opacity: 0, rotate: 90 }}
								transition={{ duration: 0.25 }}
							>
								<Sun className='w-4 h-4 text-amber-400' />
							</motion.div>
						) : (
							<motion.div
								key='moon'
								initial={{ y: -20, opacity: 0, rotate: 90 }}
								animate={{ y: 0, opacity: 1, rotate: 0 }}
								exit={{ y: 20, opacity: 0, rotate: -90 }}
								transition={{ duration: 0.25 }}
							>
								<Moon className='w-4 h-4 text-indigo-600' />
							</motion.div>
						)}
					</AnimatePresence>
				</Button>
				<Button
					variant='outline'
					size='custom'
					className='h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-md border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
					onClick={toggleSound}
				>
					{soundEnabled ? (
						<Volume2 className='w-4 h-4 text-indigo-600 dark:text-indigo-400' />
					) : (
						<VolumeX className='w-4 h-4 text-rose-500' />
					)}
				</Button>
				<Profile />
			</div>
		</header>
	)
}
