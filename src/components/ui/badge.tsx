import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-lg border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        primary:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary: cn(
          'border-transparent bg-sidebar dark:bg-background text-secondary-foreground [a&]:hover:bg-muted-foreground/20',
        ),

        success:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 [a&]:hover:bg-green-200 dark:[a&]:hover:bg-green-800',

        info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 [a&]:hover:bg-blue-200 dark:[a&]:hover:bg-blue-800',

        warning:
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 [a&]:hover:bg-yellow-200 dark:[a&]:hover:bg-yellow-800',

        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        muscle:
          'bg-green-500/70 text-black [a&]:hover:bg-green-500/90 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/40 dark:bg-green-500/60 border-none dark:text-white',

        equipment: cn(
          'bg-cyan-500/70 text-black [a&]:hover:bg-cyan-500/90 focus-visible:ring-cyan-500/20 dark:focus-visible:ring-cyan-500/40 dark:bg-cyan-500 border-none text-white',
          'dark:bg-cyan-500/60',
        ),
        premium:
          'bg-gradient-to-br from-yellow-600 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0',

        // Difficulty level variants - subtle, readable in both light/dark modes
        beginner:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 [a&]:hover:bg-green-200 dark:[a&]:hover:bg-green-800',
        intermediate:
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 [a&]:hover:bg-yellow-200 dark:[a&]:hover:bg-yellow-800',
        advanced:
          'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 [a&]:hover:bg-orange-200 dark:[a&]:hover:bg-orange-800',
        expert:
          'border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 [a&]:hover:bg-red-200 dark:[a&]:hover:bg-red-800',
      },
      size: {
        '2xs': cn(
          'text-[10px] px-[3px] py-[1px] rounded-[3px] [&>svg]:size-2.5',
        ),
        xs: cn(' text-xs px-[6px] py-[1px] [&>svg]:size-3'),
        sm: cn('text-xs px-1.5 py-0.5 [&>svg]:size-3'),
        md: 'text-xs px-2 py-0.5 [&>svg]:size-3',
        lg: 'text-sm px-3 py-1 [&>svg]:size-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    isLoading?: boolean
  }

function Badge({
  className,
  variant,
  size,
  isLoading,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant: isLoading ? 'secondary' : variant, size }),
        isLoading && 'masked-placeholder-text',
        className,
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
