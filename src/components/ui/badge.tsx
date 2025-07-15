import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        primary:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary: cn(
          'border-transparent bg-muted-foreground/10 dark:bg-muted-foreground/10 text-secondary-foreground [a&]:hover:bg-muted-foreground/20',
        ),

        tertiary: cn(
          'border-transparent bg-card/50 dark:bg-muted/30 text-secondary-foreground [a&]:hover:bg-card/70 dark:[a&]:hover:bg-muted/40',
        ),

        success: cn(
          'border-transparent bg-green-500/70 text-black [a&]:hover:bg-green-500/90 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/40 dark:bg-green-500/60',
          'dark:bg-green-500/60',
        ),

        info: cn(
          'border-transparent bg-blue-500/70 text-black [a&]:hover:bg-blue-500/90 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-500/40 dark:bg-blue-500/60',
          'dark:bg-blue-500/60',
        ),

        warning: cn(
          ' border-transparent bg-amber-500/70 text-black [a&]:hover:bg-amber-500/90 focus-visible:ring-amber-500/20 dark:focus-visible:ring-amber-500/40 dark:bg-amber-500/60',
          'dark:bg-amber-500/60',
        ),

        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        muscle:
          'bg-green-500/70 text-black [a&]:hover:bg-green-500/90 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/40 dark:bg-green-500/60 border-none text-white',
        equipment:
          'bg-blue-500/70 text-black [a&]:hover:bg-blue-500/90 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-500/40 dark:bg-blue-500/60 border-none text-white',
      },
      size: {
        xs: cn('text-xs px-[4px] py-[1px] rounded-sm'),
        sm: cn('text-xs px-1.5 py-0.5'),
        md: 'text-xs px-2 py-0.5',
        lg: 'text-sm px-3 py-1',
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
