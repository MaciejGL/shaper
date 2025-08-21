'use client'

import type React from 'react'
import { useEffect } from 'react'
import { type ReactNode, createContext, useContext } from 'react'

import {
  type UseConfirmationModalProps,
  useConfirmationModal,
} from '@/hooks/use-confirmation-modal'

import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

export interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  variant?: 'default' | 'destructive'
  isLoading?: boolean
  children?: React.ReactNode
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  isLoading = false,
  children,
}: ConfirmationModalProps) {
  // Ensure proper cleanup when component unmounts or open state changes
  useEffect(() => {
    if (!open) {
      // Force cleanup of any lingering modal state
      document.body.style.pointerEvents = ''
      document.body.style.overflow = ''
    }
  }, [open])

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await onConfirm()
      // Only close if the action succeeded
      onOpenChange(false)
    } catch (error) {
      console.error('Confirmation action failed:', error)
      // Don't close the modal if there's an error
    }
  }

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (onCancel) {
      onCancel()
    }
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      // Only allow closing if not loading
      handleCancel()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent dialogTitle={title} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
          {children && <div className="mt-4">{children}</div>}
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            variant="secondary"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            variant={variant}
            data-confirm-button
          >
            {isLoading ? 'Loading...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ConfirmationModalContextType {
  openModal: (props: UseConfirmationModalProps) => void
  closeModal: () => void
}

const ConfirmationModalContext = createContext<
  ConfirmationModalContextType | undefined
>(undefined)

export function ConfirmationModalProvider({
  children,
}: {
  children: ReactNode
}) {
  const {
    isOpen,
    isLoading,
    modalProps,
    openModal,
    closeModal,
    handleConfirm,
    handleCancel,
    cleanup,
  } = useConfirmationModal()

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isLoading) {
        closeModal()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, isLoading, closeModal])

  return (
    <ConfirmationModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalProps && (
        <ConfirmationModal
          open={isOpen}
          onOpenChange={(open) => {
            if (!open && !isLoading) {
              closeModal()
            }
          }}
          title={modalProps.title}
          description={modalProps.description}
          confirmText={modalProps.confirmText}
          cancelText={modalProps.cancelText}
          variant={modalProps.variant}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isLoading={isLoading}
        >
          {modalProps.children}
        </ConfirmationModal>
      )}
    </ConfirmationModalContext.Provider>
  )
}

export function useConfirmationModalContext() {
  const context = useContext(ConfirmationModalContext)
  if (context === undefined) {
    throw new Error(
      'useConfirmationModalContext must be used within a ConfirmationModalProvider',
    )
  }
  return context
}
