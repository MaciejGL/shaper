'use client'

import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'

import { cn } from '@/lib/utils'

function Drawer({
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & {
  onClose?: () => void
}) {
  const handleOpenChange = (open: boolean) => {
    if (typeof window === 'undefined') {
      onOpenChange?.(open)
      return
    }

    if (open) {
      // Drawer opening - check if at top and adjust scroll to disable pull-to-refresh
      const currentScrollY =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop

      setTimeout(() => {
        window.scrollTo({ top: currentScrollY + 2, behavior: 'instant' })
      }, 1)
    }
    // No need to restore scroll position - it naturally returns to 0 when drawer closes

    onOpenChange?.(open)
  }

  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      onOpenChange={handleOpenChange}
      {...props}
    />
  )
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  dialogTitle,
  grabber = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
  dialogTitle: string
  grabber?: boolean
}) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'group/drawer-content bg-sidebar fixed z-50 flex flex-col h-full',
          'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b',
          'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[calc(95dvh-var(--safe-area-inset-bottom,0px)-var(--safe-area-inset-top,0px))] data-[vaul-drawer-direction=bottom]:rounded-t-2xl',
          'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm',
          'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm focus-visible:outline-none',
          className,
        )}
        {...props}
      >
        {dialogTitle && (
          <DrawerTitle className="sr-only">{dialogTitle}</DrawerTitle>
        )}
        {grabber && (
          <div className="bg-primary/5 mx-auto mt-2 hidden h-1 w-[70px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4 bg-sidebar', className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('text-foreground font-semibold', className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}

type SimpleDrawerProps = {
  title: string
  headerIcon?: React.ReactNode
  header?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function SimpleDrawerContent({
  title,
  headerIcon,
  header,
  children,
  footer,
  className,
}: SimpleDrawerProps) {
  const Icon = headerIcon
  return (
    <DrawerContent dialogTitle={title}>
      <div className="flex flex-col h-full">
        <DrawerHeader className="border-b flex-none">
          {header ? (
            header
          ) : (
            <DrawerTitle className="flex items-center gap-2">
              {Icon && Icon}
              {title}
            </DrawerTitle>
          )}
        </DrawerHeader>

        <div className={cn('min-h-0 p-4 flex-1 overflow-y-auto', className)}>
          {children}
        </div>

        {footer && (
          <DrawerFooter className="sticky bottom-0 border-t p-4 flex-none">
            {footer}
          </DrawerFooter>
        )}
      </div>
    </DrawerContent>
  )
}
