'use client'

import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'

import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

function Drawer({
  open,
  onOpenChange,
  onClose,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & {
  onClose?: () => void
}) {
  const isMobile = useIsMobile()
  const historyPushedRef = React.useRef(false)
  const isClosingFromPopstateRef = React.useRef(false)
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | number | null>(null)

  // Create a unified close handler that works with both onOpenChange and onClose patterns
  const handleDrawerClose = React.useCallback(() => {
    if (onOpenChange) {
      onOpenChange(false)
    } else if (onClose) {
      onClose()
    }
  }, [onOpenChange, onClose])

  // Handle back button behavior on mobile
  React.useEffect(() => {
    if (!isMobile) return
    const handlePopstate = () => {
      // If drawer is open when popstate fires, close it with animation delay
      if (open && historyPushedRef.current) {
        // Prevent default navigation by pushing state back
        window.history.pushState({ drawerOpen: true }, '')

        // Mark as closing from popstate to prevent cleanup interference
        isClosingFromPopstateRef.current = true

        // Start closing animation
        handleDrawerClose()

        // After animation completes, go back in history
        closeTimeoutRef.current = setTimeout(() => {
          if (historyPushedRef.current) {
            historyPushedRef.current = false
            isClosingFromPopstateRef.current = false
            window.history.back()
          }
          closeTimeoutRef.current = null
        }, 200) // Allow 200ms for closing animation
      }
    }

    if (open && !historyPushedRef.current) {
      // Push history state when drawer opens
      window.history.pushState({ drawerOpen: true }, '')
      historyPushedRef.current = true

      // Add popstate listener
      window.addEventListener('popstate', handlePopstate)
    }

    return () => {
      window.removeEventListener('popstate', handlePopstate)
      // Clear any pending timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [isMobile, open, handleDrawerClose])

  // Reset tracking when drawer closes
  React.useEffect(() => {
    if (
      !open &&
      historyPushedRef.current &&
      !isClosingFromPopstateRef.current
    ) {
      // Reset refs when drawer closes normally (not from back button)
      historyPushedRef.current = false
      isClosingFromPopstateRef.current = false

      // Clear any pending timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [open])

  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleDrawerClose()
        } else if (onOpenChange) {
          onOpenChange(newOpen)
        }
      }}
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
          'group/drawer-content bg-sidebar fixed z-50 flex flex-col h-auto',
          'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b',
          'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[calc(95vh-var(--safe-area-inset-bottom,0px))] data-[vaul-drawer-direction=bottom]:rounded-t-2xl',
          'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm',
          'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm',
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

      <div
        className={cn(
          'flex-1 min-h-0 p-4 overflow-y-auto flex flex-col',
          className,
        )}
      >
        {children}
      </div>

      {footer && (
        <DrawerFooter className="sticky bottom-0 border-t p-4 flex-none">
          {footer}
        </DrawerFooter>
      )}
    </DrawerContent>
  )
}
