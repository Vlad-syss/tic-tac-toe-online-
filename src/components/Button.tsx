import { cva, type VariantProps } from 'class-variance-authority'
import cn from 'classnames'
import * as React from 'react'

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
	{
		variants: {
			variant: {
				green: 'bg-green-500 text-white hover:bg-green-600',
				greenOutline:
					'border border-green-500 text-green-500 hover:bg-green-100',
				greenDark: 'bg-green-700 text-white hover:bg-green-800',
				greenLight: 'bg-green-300 text-green-900 hover:bg-green-400',
			},
			size: {
				default: 'h-10 px-4 py-2 rounded-[5px]',
				sm: 'h-9 rounded-[5px] px-3',
				lg: 'h-11 rounded-[5px] px-6 text-[17px]',
				icon: 'h-10 w-10',
				costum: '',
			},
		},
		defaultVariants: {
			variant: 'green',
			size: 'default',
		},
	}
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		return (
			<button
				className={cn(buttonVariants({ variant, size }), className)}
				ref={ref}
				{...props}
			/>
		)
	}
)
Button.displayName = 'Button'

export { Button, buttonVariants }
