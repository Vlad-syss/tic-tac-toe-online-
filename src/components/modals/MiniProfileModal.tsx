import { CircleUser, PenLine } from 'lucide-react'
import { motion } from 'motion/react'
import { FC } from 'react'
import { LogoutButton } from '../LogoutButton'
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
				className='px-1 py-1 rounded-md bg-emerald-400 text-emerald-800 shadow-lg shadow-emerald-900/20 z-50 w-[160px] absolute mt-2 text-xs'
				style={{
					top: position.y,
					left: position.x + 40,
				}}
			>
				<ul className='flex flex-col'>
					<li className='flex items-center justify-between py-2 px-1 rounded-sm rounded-b-none hover:bg-emerald-100/30 cursor-pointerv border-b'>
						<span className='text-gray-700'>View Profile</span>
						<CircleUser className='text-gray-500 w-4 h-4' />
					</li>
					<li className='flex items-center justify-between py-2 px-1 rounded-sm rounded-b-none  hover:bg-emerald-100/30 cursor-pointer border-b'>
						<span className='text-gray-700'>Edit Profile</span>
						<PenLine className='text-gray-500 w-4 h-4' />
					</li>
					<li className='flex items-center justify-between py-2 px-1 rounded-b-none bg-emerald-900/20  hover:bg-emerald-100/30 cursor-pointer border-b'>
						<label htmlFor='#logout' className='text-gray-900 font-semibold'>
							Logout
						</label>
						<LogoutButton
							id='logout'
							className='w-auto h-auto bg-transparent hover:bg-transparent px-0 font-semibold'
						/>
					</li>
				</ul>
			</motion.div>
		</motion.div>
	)
}
