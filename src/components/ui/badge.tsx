import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  cn(
    'inline-flex items-center justify-center rounded-md border w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden bg-violet-50 text-violet-700 border-violet-200 font-medium px-2.5 py-0.5',
  ),
  {
    variants: {
      variant: {
        default:
          'bg-violet-500 border-transparent text-white  [a&]:hover:bg-violet-600',
        secondary:
          'bg-violet-50 text-violet-700 border-violet-200 [a&]:hover:bg-violet-100 border-transparent',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'bg-violet-50 text-violet-700 border-violet-200 [a&]:hover:bg-violet-100',
      },
      size: {
        sm: 'px-2.5 py-0.5 text-[0.6rem]',
        md: cn('px-2.5 py-0.5 text-xs'),
        lg: 'px-3 py-0.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
