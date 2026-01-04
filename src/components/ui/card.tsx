import { VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const cardVariants = cva(
  cn(
    'text-card-foreground flex flex-col gap-6 rounded-2xl py-4 relative bg-card border border-border transition-[border,shadow] duration-200 shadow-xl',
  ),
  {
    variants: {
      variant: {
        secondary: 'bg-card border-border',
        tertiary: 'bg-card-on-card border-border',
        highlighted: cn(
          ' bg-linear-to-tr dark:from-neutral-600 dark:via-neutral-700 dark:to-neutral-800 from-neutral-100 via-neutral-300 to-neutral-400 border-none',
        ),
        premium:
          'relative bg-card border-[1.5px] border-transparent bg-origin-border [background-clip:padding-box,border-box] [background-image:linear-gradient(var(--card),var(--card)),linear-gradient(135deg,rgb(245_158_11),rgb(251_146_60),rgb(249_115_22))] dark:[background-image:linear-gradient(var(--card),var(--card)),linear-gradient(135deg,rgb(251_191_36),rgb(251_146_60),rgb(251_146_60))] shadow-xl',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  },
)

export type CardProps = React.ComponentProps<'div'> & {
  variant?: VariantProps<typeof cardVariants>['variant']
  hoverable?: boolean
}

function Card({
  className,
  children,
  variant,
  hoverable = false,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        props.onClick && 'cursor-pointer',
        cardVariants({ variant }),
        className,
        hoverable && 'hover:border-primary/50',
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-tight font-semibold text-lg', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-4', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-4 [.border-t]:pt-3', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
