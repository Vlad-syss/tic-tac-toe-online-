import { ReactNode } from 'react'

export const Container = ({
	children,
	size = 'md',
}: {
	children: ReactNode
	size?: 'sm' | 'md' | 'lg' | 'xl'
}) => {
	const sizeClass = {
		sm: 'max-w-[65rem]',
		md: 'max-w-[70rem]',
		lg: 'max-w-[75rem]',
		xl: 'max-w-[80rem]',
	}[size]

	return (
		<div
			className={`flex flex-col w-full h-full ${sizeClass} mx-auto py-2 px-4`}
		>
			{children}
		</div>
	)
}
