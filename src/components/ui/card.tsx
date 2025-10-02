import { VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const cardVariants = cva(
  cn(
    'text-card-foreground flex flex-col gap-6 rounded-lg py-4 relative shadow-xs bg-card border border-border  transition-[border] duration-200 shadow-xs',
  ),
  {
    variants: {
      variant: {
        secondary:
          'bg-card border-0 dark:shadow-none shadow-xs border-border dark:border-border/50 border',
        tertiary: 'border-0 shadow-xs bg-card-on-card',
        gradient:
          'border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-white via-white to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800',
        premium: cn(
          'bg-gradient-to-br border-0 shadow-sm text-primary-foreground [&_svg]:text-primary-foreground',
          'border-zinc-200 dark:border-amber-500 bg-gradient-to-br from-white via-white to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800',
        ),
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  },
)

export type CardProps = React.ComponentProps<'div'> & {
  variant?: VariantProps<typeof cardVariants>['variant']
  borderless?: boolean
  hoverable?: boolean
}

function Card({
  className,
  children,
  variant,
  borderless = false,
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
        borderless && 'border-0',
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
      className={cn('flex items-center px-4 [.border-t]:pt-6', className)}
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
