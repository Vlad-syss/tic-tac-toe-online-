import { CircleUser } from 'lucide-react'
import { motion } from 'motion/react'
import { FC } from 'react'
import { LogoutButton } from '@/features/auth'

interface MiniProfileModalProps {
	isOpen: boolean
	onClose: () => void
	position: { x: number; y: number }
}

export const MiniProfileModal: FC<MiniProfileModalProps> = ({
	isOpen,
	onClose,
	position,
}) => {
	const variants = {
		hidden: {
			opacity: 0,
			y: 30,
		},
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.3 },
		},
		exit: {
			opacity: 0,
			y: 30,
			transition: { duration: 0.3 },
		},
	}

	if (!isOpen) return null
	return (
		<motion.div
			onClick={onClose}
			className='fixed inset-0 z-50'
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
		>
			<motion.div
				variants={variants}
				initial='hidden'
				animate='visible'
				exit='exit'
				className='px-1 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-lg shadow-black/10 dark:shadow-black/30 border border-slate-200 dark:border-slate-700 w-[160px] absolute mt-2 text-xs z-51'
				style={{
					top: position.y,
					left: position.x + 40,
				}}
				onClick={e => e.stopPropagation()}
			>
				<ul className='flex flex-col'>
					<a
						href='/profile'
						className='flex items-center justify-between py-2 px-1 rounded-sm rounded-b-none hover:bg-slate-100 dark:hover:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700'
					>
						<span className='text-slate-600 dark:text-slate-300'>View Profile</span>
						<CircleUser className='text-slate-400 w-4 h-4' />
					</a>

					<li className='flex items-center justify-between py-2 px-1 rounded-b-none bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-200 dark:border-slate-700'>
						<label
							htmlFor='logout'
							className='text-slate-900 dark:text-slate-100 font-semibold cursor-pointer'
						>
							Logout
						</label>
						<LogoutButton className='w-auto h-auto bg-transparent hover:bg-transparent px-0 font-semibold' />
					</li>
				</ul>
			</motion.div>
		</motion.div>
	)
}
