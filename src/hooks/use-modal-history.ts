import { useEffect, useRef } from 'react'

/**
 * Simple hook to manage modal history for proper back button behavior
 *
 * When modal opens, adds a history entry. When back button pressed, closes modal.
 * No visible URL changes, works perfectly with nested modals.
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
  const hasAddedHistoryRef = useRef(false)
  const isClosingViaBackButtonRef = useRef(false)

  useEffect(() => {
    if (isOpen && !hasAddedHistoryRef.current) {
      // Add history entry when modal opens
      history.pushState({ modal: true }, '')
      hasAddedHistoryRef.current = true

      // Listen for back button
      const handlePopState = () => {
        isClosingViaBackButtonRef.current = true
        hasAddedHistoryRef.current = false
        onClose()
      }

      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    } else if (!isOpen && hasAddedHistoryRef.current) {
      // Modal closed programmatically (clicking X, clicking outside, etc.)
      // Remove the history entry we added
      hasAddedHistoryRef.current = false

      if (!isClosingViaBackButtonRef.current) {
        // Only go back if not already going back
        history.back()
      }

      isClosingViaBackButtonRef.current = false
    }
  }, [isOpen, onClose])
}
