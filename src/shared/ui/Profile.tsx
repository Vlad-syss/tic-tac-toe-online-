import { clsx as cn } from 'clsx'
import {
	Circle,
	Settings2,
	Square,
	Triangle,
	X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Id } from '../../../convex/_generated/dataModel'
import { useGetUserById, useUser } from '@/features/auth'
import { useMiniProfileModal } from '@/shared/modals/useMiniProfileModal'
import { SymbolType } from '@/entities/game'
import { Button } from './Button'
import { MiniProfileModal } from '@/shared/modals/MiniProfileModal'
import { HeaderProfileSkeleton } from '@/shared/ui/skeletons'

interface ProfileProps {
	isGame?: boolean
	userId?: Id<'users'>
	isAi?: boolean
	reverse?: boolean
	userSymbol?: SymbolType | null
}

export const Profile = ({
	isGame,
	userId,
	isAi,
	reverse,
	userSymbol,
}: ProfileProps) => {
	const { user, isLoading } =
		isGame && userId ? useGetUserById(userId) : useUser()
	const { isOpen, onClose, onOpen } = useMiniProfileModal()
	const profileRef = useRef<HTMLDivElement>(null)
	const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })

	const handleOpenModal = () => {
		if (profileRef.current) {
			const rect = profileRef.current.getBoundingClientRect()

			setModalPosition({
				x: rect.left + window.scrollX,
				y: rect.bottom + window.scrollY,
			})
		}
		onOpen()
	}

	if (isLoading) {
		return <HeaderProfileSkeleton />
	}
	if (!user) return <p>User not found</p>
	return (
		<div className='relative flex gap-2 items-top group' ref={profileRef}>
			<div
				className={cn(
					'flex gap-2 select-none',
					reverse && 'flex-row-reverse justify-end text-right'
				)}
			>
				<a
					href='/profile'
					className={cn(
						'cursor-pointer relative',
						isGame && 'pointer-events-none'
					)}
				>
					<img
						src={user.avatarUrl?.split('=')[0] || './default-avatar.png'}
						alt='profile_img'
						className={cn(
							'rounded border border-slate-300 dark:border-slate-600',
							isGame ? 'w-9 h-9 sm:w-[50px] sm:h-[50px]' : 'w-[50px] h-[50px]'
						)}
					/>
					{userSymbol && (
						<div
							className={cn(
								'absolute -top-1',
								reverse ? '-left-1' : '-right-1'
							)}
						>
							{userSymbol === 'O' && (
								<Circle className='w-5 h-5 bg-white dark:bg-slate-900 p-[3px] rounded-full text-sky-500' />
							)}
							{userSymbol === 'Square' && (
								<Square className='w-5 h-5 bg-white dark:bg-slate-900 p-[3px] rounded-full text-violet-500' />
							)}
							{userSymbol === 'Triangle' && (
								<Triangle className='w-5 h-5 bg-white dark:bg-slate-900 p-[3px] rounded-full text-amber-500' />
							)}
							{userSymbol === 'X' && (
								<X className='w-5 h-5 bg-white dark:bg-slate-900 p-[3px] rounded-full text-rose-500' />
							)}
						</div>
					)}
				</a>

				<div className='flex flex-col gap-0.5'>
					<h4 className={cn('truncate', isGame ? 'text-xs sm:text-sm max-w-[80px] sm:max-w-none' : 'text-sm')}>{user.name}</h4>
					{!isAi && isGame && (
						<p className='text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs leading-2'>
							Rating: <span className='font-semibold'>{user.onlineRating}</span>
						</p>
					)}
					{isAi && isGame && (
						<p className='text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs leading-2'>
							Rating: <span className='font-semibold'>{user.offlineRating}</span>
						</p>
					)}
					{!isGame && (
						<>
							<p className='text-slate-500 dark:text-slate-400 text-xs leading-2'>
								Rating online:{' '}
								<span className='font-semibold'>{user.onlineRating}</span>
							</p>
							<p className='text-slate-500 dark:text-slate-400 text-xs leading-5'>
								Rating offline:{' '}
								<span className='font-semibold'>{user.offlineRating}</span>
							</p>
						</>
					)}
				</div>
			</div>

			{!isGame && (
				<Button
					size='custom'
					variant='outline'
					className='h-5 w-5 p-0 border-slate-400 dark:border-slate-600 rounded-sm group-hover:bg-slate-200 dark:group-hover:bg-slate-600/40 hover:bg-slate-200 dark:hover:bg-slate-600/40 cursor-pointer'
					onClick={handleOpenModal}
				>
					<Settings2 className='text-slate-500 dark:text-slate-400 h-3 w-3' />
				</Button>
			)}

			{!isGame && (
				<MiniProfileModal
					isOpen={isOpen}
					onClose={onClose}
					position={modalPosition}
				/>
			)}
		</div>
	)
}
