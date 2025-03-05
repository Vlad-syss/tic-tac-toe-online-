export const MainTitle = ({
	fontSize = 'md',
}: {
	fontSize?: 'sm' | 'md' | 'lg' | 'xl'
}) => {
	const fontSizeClass = {
		sm: 'text-xl',
		md: 'text-2xl',
		lg: 'text-4xl',
		xl: 'text-6xl',
	}[fontSize]

	return (
		<h1 className={`${fontSizeClass} font-extrabold`}>
			Tic <span className='text-lime-700'>Tic</span>{' '}
			<span className='text-lime-800'>Toe</span>
		</h1>
	)
}
