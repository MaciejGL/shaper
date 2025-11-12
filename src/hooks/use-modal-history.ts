import { useEffect, useRef } from 'react'

// Global modal stack to track all open modals in order
const modalStack: string[] = []
const MAX_STACK_SIZE = 10

// Track if we just called history.back() programmatically to ignore next popstate
let ignoreNextPopstate = false

// Safety: Clean up function to prevent stack overflow
const emergencyCleanupStack = () => {
  if (modalStack.length > MAX_STACK_SIZE) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'Modal stack exceeded limit. Clearing to prevent leak.',
        'Stack size:',
        modalStack.length,
      )
    }
    modalStack.length = 0
  }
}

/**
 * Hook to manage modal history for proper back button behavior with nested modals
 *
 * When modal opens, adds a history entry. When back button pressed, closes modal.
 * Supports nested modals - only the topmost modal closes on back button.
 * No visible URL changes, works perfectly with nested modals.
 *
 * Safety features:
 * - Cleanup on unmount prevents stack leaks
 * - Duplicate prevention avoids stack corruption
 * - Fallback behavior ensures modals always close
 * - Stack size limit prevents memory leaks
 *
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Callback to close the modal
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * useModalHistory(isOpen, () => setIsOpen(false))
 *
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogContent>...</DialogContent>
 * </Dialog>
 * ```
 */
export function useModalHistory(isOpen: boolean, onClose: () => void) {
  const modalIdRef = useRef<string>(`modal-${Math.random().toString(36)}`)
  const hasAddedHistoryRef = useRef(false)
  const isClosingViaBackButtonRef = useRef(false)

  // SAFETY: Cleanup on unmount - remove from stack even if not properly closed
  useEffect(() => {
    return () => {
      const modalId = modalIdRef.current
      const index = modalStack.indexOf(modalId)
      if (index > -1) {
        modalStack.splice(index, 1)
        if (process.env.NODE_ENV === 'development') {
          console.log('Modal cleaned up on unmount:', modalId)
        }
      }
    }
  }, [])

  useEffect(() => {
    const modalId = modalIdRef.current

    if (isOpen && !hasAddedHistoryRef.current) {
      // SAFETY: Check for duplicates before adding
      if (!modalStack.includes(modalId)) {
        emergencyCleanupStack() // Prevent stack overflow
        modalStack.push(modalId)
        history.pushState({ modal: true, modalId }, '')
        hasAddedHistoryRef.current = true

        const handlePopState = () => {
          // Ignore this popstate if it was triggered by our own history.back() call
          if (ignoreNextPopstate) {
            ignoreNextPopstate = false
            return
          }

          const isTopmost = modalStack[modalStack.length - 1] === modalId

          // SAFETY: If stack is empty but modal is open, still allow close
          const shouldClose = isTopmost || modalStack.length === 0

          if (shouldClose) {
            isClosingViaBackButtonRef.current = true
            hasAddedHistoryRef.current = false
            const index = modalStack.indexOf(modalId)
            if (index > -1) {
              modalStack.splice(index, 1)
            }
            onClose()
          }
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
      } else if (process.env.NODE_ENV === 'development') {
        console.warn('Modal ID already in stack, skipping:', modalId)
      }
    } else if (!isOpen && hasAddedHistoryRef.current) {
      // Remove from stack
      const index = modalStack.indexOf(modalId)
      const wasInStack = index > -1

      if (wasInStack) {
        modalStack.splice(index, 1)
      }

      hasAddedHistoryRef.current = false

      if (!isClosingViaBackButtonRef.current) {
        // SAFETY: Only call history.back() if:
        // 1. Modal was actually in the stack AND
        // 2. It was the topmost modal (index === current length after removal)
        const shouldCallHistoryBack = wasInStack && index === modalStack.length

        if (shouldCallHistoryBack) {
          // Set flag to ignore the popstate event this will trigger
          ignoreNextPopstate = true
          history.back()
        } else if (process.env.NODE_ENV === 'development' && wasInStack) {
          console.log('Modal closed without history.back() (not topmost)')
        }
      }

      isClosingViaBackButtonRef.current = false
    }
  }, [isOpen, onClose])
}
