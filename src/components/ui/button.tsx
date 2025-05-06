import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import { Loader2Icon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative flex gap-2 data-[loading=true]:opacity-20 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-7 rounded-md gap-1.5 px-2.5 has-[>svg]:px-2 text-xs',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        md: 'h-9 px-4 py-2 has-[>svg]:px-3',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading,
  children,
  iconStart,
  iconEnd,
  iconOnly,
  disabled,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
    iconStart?: React.ReactNode
    iconEnd?: React.ReactNode
    iconOnly?: React.ReactNode
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      data-loading={loading}
      className={cn(
        buttonVariants({
          variant,
          size: iconOnly ? 'icon' : size,
          className,
        }),
      )}
      disabled={disabled || loading}
      {...props}
    >
      {iconStart && <span>{iconStart}</span>}
      {iconOnly ? <span className="sr-only">{children}</span> : children}
      {iconOnly && iconOnly}
      {iconEnd && <span>{iconEnd}</span>}
      {loading && (
        <Loader2Icon className="animate-spin absolute inset-1/2 -translate-x-1/2 -translate-y-1/2" />
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
