'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'bg-card dark:bg-muted-foreground/10 text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[2px] shadow-xs',
  {
    variants: {
      variant: {
        default: '',
      },
      size: {
        default: 'h-9',
        sm: 'h-8',
        lg: 'h-10 p-0.5',
      },
    },
  },
)
function TabsList({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: 'default'
  size?: 'default' | 'sm' | 'lg'
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const tabsTriggerVariants = cva(
  'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:bg-background text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-30  [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 cursor-pointer',
  {
    variants: {
      variant: {
        default: '',
      },
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-sm px-3 py-1',
      },
    },
  },
)

function TabsTrigger({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: 'default'
  size?: 'default' | 'sm' | 'lg'
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant, size }), '', className)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
