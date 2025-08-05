'use client'

import React, { useCallback, useRef, useState } from 'react'

export interface UseConfirmationModalProps {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  children?: React.ReactNode
}

export function useConfirmationModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modalProps, setModalProps] =
    useState<UseConfirmationModalProps | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const openModal = useCallback((props: UseConfirmationModalProps) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setModalProps(props)
    setIsOpen(true)
    setIsLoading(false)
  }, [])

  const closeModal = useCallback(() => {
    setIsLoading(false)
    setIsOpen(false)

    // Delay clearing props to allow for smooth closing animation
    timeoutRef.current = setTimeout(() => {
      setModalProps(null)
    }, 150)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!modalProps?.onConfirm) return

    setIsLoading(true)
    try {
      await modalProps.onConfirm()
      closeModal()
    } catch (error) {
      console.error('Confirmation action failed:', error)
      setIsLoading(false)
      // Don't close modal on error
    }
  }, [modalProps, closeModal])

  const handleCancel = useCallback(() => {
    if (modalProps?.onCancel) {
      modalProps.onCancel()
    }
    closeModal()
  }, [modalProps, closeModal])

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    isOpen,
    isLoading,
    modalProps,
    openModal,
    closeModal,
    handleConfirm,
    handleCancel,
    cleanup,
  }
}
