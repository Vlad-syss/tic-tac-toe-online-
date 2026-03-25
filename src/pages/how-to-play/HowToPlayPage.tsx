import { ArrowLeft, Circle, Computer, Gamepad2, Square, Timer, Triangle, X } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/shared/ui/Button'

export const HowToPlayPage = () => {
	const navigate = useNavigate()

	return (
		<div className='max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6'>
			<Button
				variant='ghost'
				size='sm'
				className='text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
				onClick={() => navigate('/')}
			>
				<ArrowLeft className='w-4 h-4 mr-1' />
				Back
			</Button>

			<div className='bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-6 space-y-8'>
				<h1 className='text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center'>
					How to Play?
				</h1>

				{/* General Rules */}
				<section className='space-y-3'>
					<h2 className='text-xl font-semibold text-slate-900 dark:text-white'>
						General Rules
					</h2>
					<ul className='space-y-2 text-slate-600 dark:text-slate-300'>
						<li className='flex items-start gap-2'>
							<span className='font-medium text-indigo-600 dark:text-indigo-400 shrink-0'>Board sizes:</span>
							3x3, 5x5, 10x10
						</li>
						<li className='flex items-start gap-2'>
							<span className='font-medium text-indigo-600 dark:text-indigo-400 shrink-0'>Win conditions:</span>
							<span>
								3x3 — <strong>3</strong> in a row &nbsp;|&nbsp;
								5x5 — <strong>4</strong> in a row &nbsp;|&nbsp;
								10x10 — <strong>6</strong> in a row
							</span>
						</li>
						<li className='flex items-center gap-2'>
							<Timer className='w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0' />
							60 seconds per turn
						</li>
					</ul>
					<p className='text-sm text-slate-500 dark:text-slate-400'>
						Line up your symbols horizontally, vertically, or diagonally to win.
					</p>
				</section>

				<hr className='border-slate-200 dark:border-slate-700' />

				{/* AI Mode */}
				<section className='space-y-3'>
					<div className='flex items-center gap-2'>
						<Computer className='w-6 h-6 text-emerald-600 dark:text-emerald-400' />
						<h2 className='text-xl font-semibold text-slate-900 dark:text-white'>
							Play vs AI
						</h2>
					</div>
					<ul className='space-y-1.5 text-slate-600 dark:text-slate-300 list-disc list-inside'>
						<li>Challenge the AI opponent</li>
						<li>You are randomly assigned X or O</li>
						<li>If the AI gets X, it moves first</li>
						<li>Your ELO rating updates after each game</li>
					</ul>
				</section>

				<hr className='border-slate-200 dark:border-slate-700' />

				{/* Online Mode */}
				<section className='space-y-3'>
					<div className='flex items-center gap-2'>
						<Gamepad2 className='w-6 h-6 text-sky-600 dark:text-sky-400' />
						<h2 className='text-xl font-semibold text-slate-900 dark:text-white'>
							Online Game
						</h2>
					</div>
					<ul className='space-y-1.5 text-slate-600 dark:text-slate-300 list-disc list-inside'>
						<li>Play against a real player</li>
						<li>Create a game and share the invite code</li>
						<li>Your opponent joins using the code</li>
						<li>Online ELO rating is tracked separately</li>
					</ul>
				</section>

				<hr className='border-slate-200 dark:border-slate-700' />

				{/* 1v1v1v1 Mode */}
				<section className='space-y-3'>
					<div className='flex items-center gap-2'>
						<Gamepad2 className='w-6 h-6 text-violet-600 dark:text-violet-400' />
						<h2 className='text-xl font-semibold text-slate-900 dark:text-white'>
							1v1v1v1 Mode
						</h2>
					</div>
					<p className='flex items-center gap-1.5 text-slate-600 dark:text-slate-300'>
						4 players, each with a unique symbol:
						<X className='w-4 h-4 text-rose-500' />
						<Circle className='w-4 h-4 text-sky-500' />
						<Square className='w-4 h-4 text-violet-500' />
						<Triangle className='w-4 h-4 text-amber-500' />
					</p>
					<ul className='space-y-1.5 text-slate-600 dark:text-slate-300 list-disc list-inside'>
						<li>When you complete a line, you are eliminated</li>
						<li>Earlier elimination = higher rank (1st place)</li>
						<li>Last player standing finishes 4th</li>
						<li>Share the invite code with 3 other players to start</li>
					</ul>
				</section>
			</div>
		</div>
	)
}
