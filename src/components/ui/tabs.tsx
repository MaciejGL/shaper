'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva } from 'class-variance-authority'
import { motion } from 'framer-motion'
import * as React from 'react'

import { cn } from '@/lib/utils'

import { Button } from './button'

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
  'bg-card-on-card dark:bg-muted-foreground/10 text-muted-foreground inline-flex h-9 w-fit items-center justify-center py-[2px] px-[3px]',
  {
    variants: {
      variant: {
        default: 'bg-card',
        secondary: cn('bg-card-on-card border'),
      },
      size: {
        sm: 'h-8 rounded-lg',
        default: 'h-9 rounded-xl',
        lg: 'h-10 p-0.5 rounded-xl',
        xl: 'h-11 p-0.5 rounded-xl',
      },
      rounded: {
        default: 'rounded-xl',
        lg: 'rounded-lg',
        full: 'rounded-full',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
      },
    },
  },
)
function TabsList({
  className,
  variant = 'default',
  size = 'default',
  rounded = 'xl',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: 'default' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'xl'
  rounded?: 'default' | 'lg' | 'xl' | 'full' | '2xl' | '3xl'
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant, size, rounded }), className)}
      {...props}
    />
  )
}

const tabsTriggerVariants = cva(
  cn(
    ' data-[state=active]:bg-card data-[state=active]:text-foreground dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:bg-background text-foreground/80 dark:text-foreground/80 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-30  [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 cursor-pointer',
  ),
  {
    variants: {
      variant: {
        default: '',
      },
      size: {
        sm: 'text-xs rounded-lg',
        default: 'rounded-xl',
        lg: 'px-3 py-1 rounded-xl',
        xl: 'px-4 py-1.5 rounded-xl',
      },
      rounded: {
        default: 'rounded-xl',
        lg: 'rounded-lg',
        full: 'rounded-full px-4',
        xl: cn('rounded-[10px]'),
        '2xl': cn('rounded-[12px]'),
        '3xl': cn('rounded-[18px]'),
      },
    },
  },
)

function TabsTrigger({
  className,
  variant = 'default',
  size = 'default',
  rounded = 'xl',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: 'default'
  size?: 'default' | 'sm' | 'lg' | 'xl'
  rounded?: 'default' | 'lg' | 'xl' | 'full' | '2xl' | '3xl'
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        tabsTriggerVariants({ variant, size, rounded }),
        '',
        className,
      )}
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

function PrimaryTabList<T extends string>({
  options,
  onClick,
  active,
  className,
  size = 'xl',
  classNameButton,
  classNameWrapper,
}: {
  options: {
    label: string
    value: T
    icon?: React.ReactNode
    disabled?: boolean
    disabledIcon?: React.ReactNode
  }[]
  onClick: (value: T) => void
  active: T
  className?: string
  size?: 'md' | 'sm' | 'lg' | 'xl'
  classNameButton?: string
  classNameWrapper?: string
}) {
  const uniqueId = React.useId()

  return (
    <div
      className={cn(
        'rounded-[18px] bg-card/95 dark:bg-background/95 border border-zinc-400/60 dark:border-zinc-800 p-[2px] min-w-max w-full shadow-lg dark:shadow-neutral-950',
        classNameWrapper,
      )}
    >
      <div className={cn('relative flex', className)}>
        {options.map((option) => (
          <Button
            key={option.value}
            variant="variantless"
            size={size}
            onClick={() => onClick(option.value)}
            disabled={option.disabled}
            iconStart={
              <span
                className={cn(
                  'relative z-[1] transition-colors duration-500',
                  active === option.value
                    ? 'text-primary-foreground dark:text-primary'
                    : 'text-primary/80',
                )}
              >
                {option.icon}
              </span>
            }
            iconEnd={option.disabled ? option.disabledIcon : undefined}
            className={cn('relative', classNameButton)}
          >
            {active === option.value && (
              <motion.div
                layoutId={`activeTabBackground-${uniqueId}`}
                className="absolute inset-0 bg-primary dark:bg-primary/25 rounded-2xl z-0"
                transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
              />
            )}

            <span
              className={cn(
                'relative transition-colors duration-500',
                active === option.value
                  ? 'text-primary-foreground dark:text-primary'
                  : 'text-primary/80',
              )}
            >
              {option.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}

function UnderlineTabList<T extends string>({
  options,
  onClick,
  active,
  className,
  classNameTrigger,
}: {
  options: {
    label: string
    value: T
  }[]
  onClick: (value: T) => void
  active: T
  className?: string
  classNameTrigger?: string
}) {
  const uniqueId = React.useId()

  return (
    <div
      className={cn(
        'flex min-w-full w-max border-b-4 border-white/20',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = active === option.value

        return (
          <button
            key={option.value}
            onClick={() => onClick(option.value)}
            className={cn(
              'relative px-3 py-2 text-base font-medium transition-colors flex-1 ',
              isActive ? 'text-foreground' : 'text-muted-foreground',
              classNameTrigger,
            )}
          >
            <p className="w-full min-w-max text-center">{option.label}</p>
            {isActive && (
              <motion.div
                layoutId={`underlineTab-${uniqueId}`}
                className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 h-1 w-full bg-amber-500 rounded-full"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  PrimaryTabList,
  UnderlineTabList,
}
