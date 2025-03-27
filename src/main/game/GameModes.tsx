import cn from 'classnames'
import { Computer, Gamepad2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/Button'
import { useGameApi, useUser } from '../../hooks'

export const GameModes = () => {
	const { user } = useUser()
	const navigate = useNavigate()
	const [boardSize, setBoardSize] = useState(3)
	const { startGameWithAI } = useGameApi(null)

	const startGame = async (mode: string) => {
		if (user === undefined) return
		if (mode === 'ai') {
			const newGame = await startGameWithAI(user?._id, boardSize)
			if (newGame) {
				navigate(`/game/${mode}?size=${boardSize}&gameId=${newGame._id}`)
			}
		} else {
			navigate(`/game/${mode}?size=${boardSize}`)
		}
	}

	return (
		<div className='flex flex-col items-center space-y-6 p-8 bg-green-200/60 shadow-2xl rounded-lg w-full'>
			<h2 className='text-4xl font-bold text-green-800'>Game Modes</h2>
			<p className='text-lg text-green-700'>
				Welcome {user?.name || 'Guest'}, choose your challenge!
			</p>

			<div className='flex space-x-4'>
				<Button
					variant='costume'
					size='costum'
					className={cn(
						'px-4 py-2 rounded-lg text-white hover:bg-green-600',
						boardSize === 3 && 'bg-green-800',
						boardSize !== 3 && 'bg-green-900/50'
					)}
					onClick={() => setBoardSize(3)}
				>
					3x3
				</Button>
				<Button
					variant='costume'
					size='costum'
					className={cn(
						'px-4 py-2 rounded-lg text-white hover:bg-green-600',
						boardSize === 5 && 'bg-green-800',
						boardSize !== 5 && 'bg-green-900/50'
					)}
					onClick={() => setBoardSize(5)}
				>
					5x5
				</Button>
				<Button
					variant='costume'
					size='costum'
					className={cn(
						'px-4 py-2 rounded-lg text-white hover:bg-green-600',
						boardSize === 10 && 'bg-green-800',
						boardSize !== 10 && 'bg-green-900/50'
					)}
					onClick={() => setBoardSize(10)}
				>
					10x10
				</Button>
			</div>

			<div className='space-y-4 grid grid-cols-2 gap-x-4 w-full'>
				<div className='p-4 bg-green-100 rounded-lg shadow-md text-center'>
					<Computer className='mx-auto text-green-700 mb-2' size={32} />
					<h3 className='text-xl font-semibold text-green-800'>Play vs AI</h3>
					<p className='text-green-600'>
						Challenge our AI in different difficulties.
					</p>
					<Button
						className='mt-4'
						variant='greenDark'
						size='lg'
						onClick={() => startGame('ai')}
					>
						Start Game
					</Button>
				</div>

				<div className='p-4 bg-green-100 rounded-lg shadow-md text-center'>
					<Gamepad2 className='mx-auto text-blue-700 mb-2' size={32} />
					<h3 className='text-xl font-semibold text-blue-800'>Online Game</h3>
					<p className='text-blue-600'>Play against real players online!</p>
					<Button
						className='mt-4 bg-blue-600 text-blue-100 hover:bg-blue-600/90'
						variant='costume'
						size='lg'
						onClick={() => startGame('online')}
					>
						Find Opponent
					</Button>
				</div>

				<div className='p-4 bg-green-100 rounded-lg shadow-md text-center col-span-2'>
					<Gamepad2 className='mx-auto text-purple-700 mb-2' size={32} />
					<h3 className='text-xl font-semibold text-purple-800'>
						1v1v1v1 Mode
					</h3>
					<p className='text-purple-600'>New shapes: ✖️⭕ 🔳 🔺!</p>
					<Button
						className='mt-4 bg-purple-600 hover:bg-purple-600/90'
						variant='costume'
						size='lg'
						onClick={() => startGame('1v1v1v1')}
					>
						Start 2v2
					</Button>
				</div>
			</div>
		</div>
	)
}
