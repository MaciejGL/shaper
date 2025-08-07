'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva } from 'class-variance-authority'
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
  'bg-card dark:bg-muted-foreground/10 text-muted-foreground inline-flex h-9 w-fit items-center justify-center p-[2px]',
  {
    variants: {
      variant: {
        default: '',
        secondary: 'bg-muted-foreground/10',
      },
      size: {
        sm: 'h-8 rounded-lg',
        default: 'h-9 rounded-xl',
        lg: 'h-10 p-0.5 rounded-xl',
      },
      rounded: {
        default: 'rounded-xl',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
  },
)
function TabsList({
  className,
  variant = 'default',
  size = 'default',
  rounded = 'full',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: 'default' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  rounded?: 'default' | 'lg' | 'full'
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
  'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:bg-background text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-30  [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 cursor-pointer',
  {
    variants: {
      variant: {
        default: '',
      },
      size: {
        sm: 'text-xs rounded-lg',
        default: 'text-sm rounded-xl',
        lg: 'text-sm px-3 py-1 rounded-xl',
      },
      rounded: {
        default: 'rounded-xl',
        lg: 'rounded-lg',
        full: 'rounded-full px-4',
      },
    },
  },
)

function TabsTrigger({
  className,
  variant = 'default',
  size = 'default',
  rounded = 'full',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  variant?: 'default'
  size?: 'default' | 'sm' | 'lg'
  rounded?: 'default' | 'lg' | 'full'
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
}: {
  options: { label: string; value: T; icon?: React.ReactNode }[]
  onClick: (value: T) => void
  active: T
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [underlineStyle, setUnderlineStyle] = React.useState({
    width: 0,
    left: 0,
  })

  React.useEffect(() => {
    if (!containerRef.current) return

    const activeButton = containerRef.current.querySelector(
      `[data-value="${active}"]`,
    ) as HTMLElement

    if (activeButton) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()

      setUnderlineStyle({
        width: buttonRect.width,
        left: buttonRect.left - containerRect.left,
      })
    }
  }, [active])

  return (
    <div ref={containerRef} className="relative flex gap-2 mb-2 border-b">
      {options.map((option) => (
        <Button
          key={option.value}
          data-value={option.value}
          variant="variantless"
          size="lg"
          onClick={() => onClick(option.value)}
          className={cn(
            'relative rounded-none transition-colors duration-200',
            active === option.value
              ? 'text-foreground'
              : 'text-muted-foreground',
          )}
          iconStart={option.icon}
        >
          {option.label}
        </Button>
      ))}

      {/* Animated underline */}
      <div
        className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
        style={{
          width: underlineStyle.width,
          transform: `translateX(${underlineStyle.left}px)`,
        }}
      />
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, PrimaryTabList }
