import { Github, Linkedin, Mail } from 'lucide-react'

export const Footer = () => {
	return (
		<footer className='flex-[0_0_auto] flex items-center justify-between gap-1 py-2'>
			<article className='text-xs'>
				<h4>
					©Project{' '}
					<span className='text-indigo-600 dark:text-indigo-400 font-semibold'>Tic Tac Toe</span> made
					by:
				</h4>
				<p>made by Vladislav Bashak</p>
			</article>
			<ul className='flex items-center gap-2'>
				<li className='drop-shadow-xl flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 p-[10px] transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700'>
					<a href='https://github.com/vlad-syss' target='_blank'>
						<Github className='w-4 h-4' />
					</a>
				</li>
				<li className='drop-shadow-xl flex items-center justify-center rounded-xl p-[10px] border border-slate-200 dark:border-slate-700 transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-600'>
					<a
						href='https://www.linkedin.com/in/vlad-bashak-077155289'
						target='_blank'
					>
						<Linkedin className='w-4 h-4' />
					</a>
				</li>
				<li className='drop-shadow-xl flex items-center justify-center rounded-xl p-[10px] border border-slate-200 dark:border-slate-700 transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600'>
					<a href='mailto:vladbashak80@gmail.com'>
						<Mail className='w-4 h-4' />
					</a>
				</li>
			</ul>
		</footer>
	)
}
