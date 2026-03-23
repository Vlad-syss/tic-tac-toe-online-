import { cva, type VariantProps } from 'class-variance-authority'
import { clsx as cn } from 'clsx'
import * as React from 'react'

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
	{
		variants: {
			variant: {
				primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
				outline:
					'border border-indigo-500/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10',
				primaryDark: 'bg-indigo-700 text-white hover:bg-indigo-800',
				primaryLight:
					'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-500/30',
				ghost: '',
			},
			size: {
				default: 'h-10 px-4 py-2 rounded-[5px]',
				sm: 'h-9 rounded-[5px] px-3',
				lg: 'h-11 rounded-[5px] px-6 text-[17px]',
				icon: 'h-10 w-10',
				custom: '',
			},
		},
		defaultVariants: {
			variant: 'primary',
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
