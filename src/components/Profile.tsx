import { LoaderCircle, Settings2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useMiniProfileModal, useUser } from '../hooks'
import { Button } from './Button'
import { MiniProfileModal } from './modals/MiniProfileModal'

export const Profile = () => {
	const { user, isLoading } = useUser()
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
		<div
			className='relative flex gap-2 items-top group cursor-pointer'
			ref={profileRef}
		>
			<div className='flex gap-2 select-none'>
				<img
					src={user.avatarUrl?.split('=')[0] || './default-avatar.png'}
					width={50}
					height={50}
					alt='profile_img'
					className='rounded border border-green-400'
				/>
				<div className='flex flex-col gap-0.5'>
					<h4 className='text-sm truncate'>{user.name}</h4>
					<p className='text-lime-800 text-xs leading-2'>
						Rating online:{' '}
						<span className='font-semibold'>{user.onlineRating}</span>
					</p>
					<p className='text-lime-800 text-xs leading-5'>
						Rating offline:{' '}
						<span className='font-semibold'>{user.onlineRating}</span>
					</p>
				</div>
			</div>
			<Button
				size='costum'
				variant='greenOutline'
				className='h-5 w-5 p-0 border-lime-700 rounded-sm group-hover:bg-lime-400/40 hover:bg-lime-400/40 cursor-pointer'
				onClick={handleOpenModal}
			>
				<Settings2 className='text-lime-700 h-3 w-3' />
			</Button>

			<MiniProfileModal
				isOpen={isOpen}
				onClose={onClose}
				position={modalPosition}
			/>
		</div>
	)
}
