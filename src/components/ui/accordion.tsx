'use client'

import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { VariantProps, cva } from 'class-variance-authority'
import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('overflow-hidden', className)}
      {...props}
    />
  )
}

const accordionTriggerVariants = cva(
  'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180 cursor-pointer px-4',
  {
    variants: {
      variant: {
        default: cn('bg-card rounded-xl border'),
        outline: 'border border-input rounded-xl',
        minimal: 'border-b px-0',
      },
    },
  },
)

function AccordionTrigger({
  className,
  children,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  variant?: VariantProps<typeof accordionTriggerVariants>['variant']
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(accordionTriggerVariants({ variant }), className)}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-5 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

const accordionContentVariants = cva(
  'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm ',
  {
    variants: {
      variant: {
        default:
          'pt-1 pb-2 mx-1 -mt-1 rounded-b-2xl bg-card border border-border',
        grid: 'grid grid-cols-[auto_1fr] gap-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function AccordionContent({
  className,
  children,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content> & {
  variant?: VariantProps<typeof accordionContentVariants>['variant']
}) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(accordionContentVariants({ variant }), className)}
      {...props}
    >
      {variant === 'grid' && (
        <div className="w-[2px] bg-amber-500 h-full rounded-full" />
      )}
      {children}
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
