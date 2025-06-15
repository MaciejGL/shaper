import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const cardVariants = cva(
  cn(
    'bg-zinc-100 dark:bg-zinc-900 text-card-foreground flex flex-col gap-6 rounded-lg py-4 relative border border-border shadow-neuromorphic-light dark:shadow-neuromorphic-dark',
  ),
  {
    variants: {
      variant: {
        default: '',
        gradient:
          'border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-white via-white to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 border-0',
      },
    },
  },
)

function Card({
  className,
  children,
  variant,
  borderless = false,
  ...props
}: React.ComponentProps<'div'> & {
  variant?: 'default' | 'gradient'
  borderless?: boolean
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        cardVariants({ variant }),
        className,
        borderless && 'border-0',
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
      className={cn('leading-none font-semibold', className)}
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
