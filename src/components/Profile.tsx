import cn from 'classnames'
import {
	Circle,
	LoaderCircle,
	Settings2,
	Square,
	Triangle,
	X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Id } from '../../convex/_generated/dataModel'
import { useMiniProfileModal, useUser } from '../hooks'
import { useGetUserById } from '../hooks/useUser'
import { SymbolType } from '../types'
import { Button } from './Button'
import { MiniProfileModal } from './modals/MiniProfileModal'
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
		return <LoaderCircle className='animate-spin w-5 h-5' />
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
						width={50}
						height={50}
						alt='profile_img'
						className='rounded border border-green-400'
					/>
					{userSymbol && (
						<div
							className={cn(
								'absolute -top-1',
								reverse ? '-left-1' : '-right-1'
							)}
						>
							{userSymbol === 'O' && (
								<Circle className='w-5 h-5 bg-white p-1 rounded-full text-blue-500' />
							)}
							{userSymbol === 'Square' && (
								<Square className='w-5 h-5 bg-white p-1 rounded-full text-purple-500' />
							)}
							{userSymbol === 'Triangle' && (
								<Triangle className='w-5 h-5 bg-white p-1 rounded-full text-orange-500' />
							)}
							{userSymbol === 'X' && (
								<X className='w-5 h-5 bg-white p-1 rounded-full text-red-500' />
							)}
						</div>
					)}
				</a>

				<div className='flex flex-col gap-0.5'>
					<h4 className='text-sm truncate'>{user.name}</h4>
					{!isAi && isGame && (
						<p className='text-lime-800 text-xs leading-2'>
							Rating online:{' '}
							<span className='font-semibold'>{user.onlineRating}</span>
						</p>
					)}
					{isAi && isGame && (
						<p className='text-lime-800 text-xs leading-2'>
							Rating offline:{' '}
							<span className='font-semibold'>{user.offlineRating}</span>
						</p>
					)}
					{!isGame && (
						<>
							<p className='text-lime-800 text-xs leading-2'>
								Rating online:{' '}
								<span className='font-semibold'>{user.onlineRating}</span>
							</p>
							<p className='text-lime-800 text-xs leading-5'>
								Rating offline:{' '}
								<span className='font-semibold'>{user.offlineRating}</span>
							</p>
						</>
					)}
				</div>
			</div>

			{!isGame && (
				<Button
					size='costum'
					variant='greenOutline'
					className='h-5 w-5 p-0 border-lime-700 rounded-sm group-hover:bg-lime-400/40 hover:bg-lime-400/40 cursor-pointer'
					onClick={handleOpenModal}
				>
					<Settings2 className='text-lime-700 h-3 w-3' />
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
