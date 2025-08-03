import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import { Loader2Icon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none  [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 [&_svg]:size-4 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative flex cursor-pointer',
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'data-[loading=true]:bg-primary/80 data-[loading=true]:text-primary/70 disabled:bg-primary/50 data-[loading=true]:dark:bg-primary/80 data-[loading=true]:dark:text-primary-foreground/70 disabled:dark:bg-primary/50',
        ),
        destructive: cn(
          'hover:bg-accent text-destructive/75 hover:text-destructive bg-destructive/10',
          'data-[loading=true]:bg-destructive/80 disabled:bg-destructive/50',
        ),
        outline: cn(
          'border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
          'data-[loading=true]:bg-input/30 data-[loading=true]:text-input/70 disabled:bg-input/50 data-[loading=true]:dark:bg-input/30 data-[loading=true]:dark:text-input/70 disabled:dark:bg-input/50',
        ),
        secondary: cn(
          'bg-secondary hover:bg-secondary/80 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80',
          'data-[loading=true]:bg-secondary/80 data-[loading=true]:text-secondary-foreground/50 disabled:bg-secondary/50 data-[loading=true]:dark:bg-secondary/80 data-[loading=true]:dark:text-secondary-foreground/50 disabled:dark:bg-secondary/50',
        ),
        gradient: cn(
          'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0',
          'data-[loading=true]:bg-gradient-to-r data-[loading=true]:from-amber-500 data-[loading=true]:to-orange-500 data-[loading=true]:hover:from-amber-600 data-[loading=true]:hover:to-orange-600 data-[loading=true]:text-white data-[loading=true]:border-0',
        ),
        ghost: cn(
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 data-[loading=true]:bg-accent/50 disabled:bg-accent/50',
          'data-[loading=true]:bg-accent/50 data-[loading=true]:text-accent/70 disabled:bg-accent/50 data-[loading=true]:dark:bg-accent/50 data-[loading=true]:dark:text-accent/70 disabled:dark:bg-accent/50',
        ),
        link: 'text-primary underline-offset-4 hover:underline disabled:text-primary/50',
        variantless:
          'bg-transparent text-primary hover:bg-transparent shadow-none disabled:text-primary/50',
      },
      size: {
        variantless: 'h-auto p-0',
        xs: 'h-7 rounded-md px-2.5 has-[>svg]:px-2 text-xs [&_svg]:size-3',
        sm: 'h-8 rounded-md px-3 has-[>svg]:px-2.5 [&_svg]:size-3.5',
        md: 'h-9 px-4 py-2 has-[>svg]:px-3 [&_svg]:size-5',
        lg: 'h-10 text-md rounded-md px-6 has-[>svg]:px-4 [&_svg]:size-5',
        'icon-xs': 'size-7 [&_svg]:size-4',
        'icon-sm': 'size-8 [&_svg]:size-4',
        'icon-md': 'size-9 [&_svg]:size-4',
        'icon-lg': 'size-10 [&_svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
    iconStart?: React.ReactNode
    iconEnd?: React.ReactNode
    iconOnly?: React.ReactNode
  }

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
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  const defaultSize = iconOnly ? size || 'icon-md' : size || 'md'

  return (
    <Comp
      data-slot="button"
      data-loading={loading}
      className={cn(
        buttonVariants({
          variant,
          size: defaultSize,
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
        <Loader2Icon
          className={cn(
            'size-[70%] animate-spin absolute z-10 inset-1/2 -translate-x-1/2 -translate-y-1/2 text-primary',
            variant === 'default' && 'text-primary',
          )}
        />
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
