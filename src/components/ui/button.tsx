import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import { Loader2Icon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 [&_svg]:size-4 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative flex cursor-pointer',
    // Improved loading state with text dimming instead of transparency
    'data-[loading=true]:pointer-events-none data-[loading=true]:opacity-80',
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-primary text-primary-foreground hover:bg-primary/90',
          // Loading state with dimmed text and maintained background
          'data-[loading=true]:bg-primary/90 data-[loading=true]:text-primary-foreground/30 disabled:bg-primary/50 disabled:text-primary-foreground/50',
        ),
        destructive: cn(
          'hover:bg-accent text-destructive/75 hover:text-destructive bg-destructive/10',
          // Loading state for destructive variant
          'data-[loading=true]:bg-destructive/15 data-[loading=true]:text-destructive/30 disabled:bg-destructive/5 disabled:text-destructive/30',
        ),
        outline: cn(
          'border hover:bg-accent hover:text-accent-foreground dark:border-input dark:hover:bg-input/50',
          // Loading state for outline variant
          'data-[loading=true]:bg-accent/30 data-[loading=true]:text-accent-foreground/30 disabled:bg-input/20 disabled:text-foreground/30',
        ),
        secondary: cn(
          'bg-card hover:bg-secondary/80 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80 border border-border',
          // Loading state for secondary variant
          'data-[loading=true]:bg-card/90 data-[loading=true]:text-secondary-foreground/30 disabled:bg-card/50 disabled:text-secondary-foreground/40 dark:disabled:bg-secondary/50 dark:disabled:text-secondary-foreground/40',
        ),
        tertiary: cn(
          'bg-card-on-card hover:bg-primary/15 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80 disabled:dark:opacity-40 shadow-xs',
          // Loading state for tertiary variant
          'data-[loading=true]:bg-card-on-card/12 data-[loading=true]:text-foreground/10 disabled:bg-card-on-card/5 disabled:text-foreground/30',
        ),
        gradient: cn(
          'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0',
          // Loading state for gradient variant
          'data-[loading=true]:from-amber-500/90 data-[loading=true]:to-orange-500/90 data-[loading=true]:text-white/40 disabled:from-amber-500/50 disabled:to-orange-500/50 disabled:text-white/40',
        ),
        ghost: cn(
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
          // Loading state for ghost variant
          'data-[loading=true]:bg-accent/30 data-[loading=true]:text-accent-foreground/30 disabled:bg-accent/20 disabled:text-accent-foreground/30',
        ),
        link: cn(
          'text-primary underline-offset-4 hover:underline',
          // Loading state for link variant
          'data-[loading=true]:text-primary/30 disabled:text-primary/40',
        ),
        variantless: cn(
          'bg-transparent text-primary hover:bg-transparent shadow-none',
          // Loading state for variantless
          'data-[loading=true]:text-primary/30 disabled:text-primary/40',
        ),
      },
      size: {
        variantless: 'h-auto p-0',
        xs: 'h-7 rounded-lg px-2.5 has-[>svg]:px-2 text-xs [&_svg]:size-3',
        sm: 'h-8 rounded-lg px-3 has-[>svg]:px-2.5 [&_svg]:size-3.5',
        md: 'h-9 px-4 py-2 has-[>svg]:px-3 [&_svg]:size-4',
        lg: 'h-10 text-sm px-6 has-[>svg]:px-4 [&_svg]:size-4.5',
        xl: 'h-12 text-md px-8 has-[>svg]:px-5 [&_svg]:size-6',
        'icon-xs': 'size-7 [&_svg]:size-4 rounded-lg',
        'icon-sm': 'size-8 [&_svg]:size-4 rounded-lg',
        'icon-md': 'size-9 [&_svg]:size-4',
        'icon-lg': 'size-10 [&_svg]:size-4',
        'icon-xl': 'size-12 [&_svg]:size-5',
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

/**
 * Use exapmle:
 *
 * <Button variant="secondary" size="md"  onClick={() => refetch()} iconStart={<RefreshCw />} loading={isLoading} disabled={isLoading}  iconEnd={<RefreshCw />}>
 *   Refresh
 * </Button>
 *
 * iconButton: just a button with an icon
 * <Button variant="icon-md" iconOnly={<RefreshCw />} loading={isLoading} disabled={isLoading} />
 *
 *
 * @param param0
 * @returns
 */

function Button({
  className,
  variant = 'default',
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

  // Function to get loader color based on variant
  const getLoaderColorClass = () => {
    switch (variant) {
      case 'default':
      case 'gradient':
        return 'text-primary-foreground'
      case 'destructive':
        return 'text-destructive'
      case 'outline':
      case 'ghost':
      case 'tertiary':
        return 'text-accent-foreground dark:text-secondary-foreground'
      case 'secondary':
        return 'text-secondary-foreground'
      case 'link':
      case 'variantless':
        return 'text-primary'
      default:
        return 'text-primary-foreground'
    }
  }

  return (
    <Comp
      data-slot="button"
      data-loading={loading}
      suppressHydrationWarning
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
          data-loading={loading}
          className={cn(
            'size-[70%] animate-spin absolute z-10 inset-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200',
            getLoaderColorClass(),
          )}
        />
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
