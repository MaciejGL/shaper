import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-xl border px-4 py-3.5 text-sm grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-start shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]',
  {
    variants: {
      variant: {
        default: 'bg-card-on-card text-card-foreground border-border',
        info: 'bg-card-on-card text-foreground border-border',
        warning: 'bg-card-on-card text-foreground border-border',
        destructive: 'bg-card-on-card text-foreground border-border',
        success: 'bg-card-on-card text-foreground border-border',
      },
      size: {
        default: '',
        sm: 'py-1.5 px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const dotVariants = cva('size-2 rounded-full mt-2 mr-1.5 shrink-0', {
  variants: {
    variant: {
      default: 'bg-foreground/40 shadow-sm',
      info: 'bg-blue-500 dark:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)] dark:shadow-[0_0_8px_rgba(96,165,250,0.6)]',
      warning:
        'bg-amber-500 dark:bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)] dark:shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      destructive:
        'bg-red-500 dark:bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)] dark:shadow-[0_0_8px_rgba(248,113,113,0.6)]',
      success:
        'bg-green-500 dark:bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)] dark:shadow-[0_0_8px_rgba(74,222,128,0.6)]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function Alert({
  className,
  withoutTitle,
  variant,
  size,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof alertVariants> & { withoutTitle?: boolean }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant, size }), className)}
      {...props}
    >
      <div className={cn(dotVariants({ variant }), withoutTitle && 'mt-0')} />
      {props.children}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'col-start-2 line-clamp-1 min-h-5 font-semibold tracking-tight text-base',
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed leading-relaxed',
        className,
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
