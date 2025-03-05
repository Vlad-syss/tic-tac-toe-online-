export const Logo = ({ size }: { size?: number }) => {
	return (
		<img
			src='https://cdn-icons-png.flaticon.com/128/18907/18907181.png'
			width={size ? size : 'auto'}
			height={size ? size : 'auto'}
			className='select-none'
		/>
	)
}
