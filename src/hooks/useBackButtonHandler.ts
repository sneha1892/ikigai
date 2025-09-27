import { useEffect, useRef, useCallback } from 'react'

interface ModalState {
  id: string
  onClose: () => void
  priority: number // Higher priority modals are closed first (for nested modals)
}

// Global state to track all open modals
let openModals: ModalState[] = []
let isListening = false

const addModal = (modal: ModalState) => {
  // Remove existing modal with same id if it exists
  openModals = openModals.filter(m => m.id !== modal.id)
  // Add new modal
  openModals.push(modal)
  // Sort by priority (highest first)
  openModals.sort((a, b) => b.priority - a.priority)
}

const removeModal = (id: string) => {
  openModals = openModals.filter(m => m.id !== id)
}

const handleBackButton = (event: PopStateEvent) => {
  if (openModals.length > 0) {
    // Prevent browser navigation
    event.preventDefault()
    
    // Close the highest priority modal
    const topModal = openModals[0]
    if (topModal) {
      topModal.onClose()
    }
    
    // Push a new state to maintain browser history
    window.history.pushState(null, '', window.location.href)
  }
}

const startListening = () => {
  if (!isListening) {
    // Add a dummy state to the history stack when first modal opens
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handleBackButton)
    isListening = true
  }
}

const stopListening = () => {
  if (isListening && openModals.length === 0) {
    window.removeEventListener('popstate', handleBackButton)
    isListening = false
  }
}

/**
 * Custom hook to handle back button navigation for modals and dialogs
 * 
 * @param id - Unique identifier for the modal
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Function to call when the modal should be closed
 * @param priority - Priority level (higher = closed first). Priority guide:
 *   - 100: Confirmation dialogs (delete confirmations)
 *   - 50: Standalone modals (SimpleTaskModal)
 *   - 30: Parent modals that can contain nested modals (QuickAddModal)
 *   - 20: Root modals (RoutineModal)
 *   - 10: Nested child modals (AddGoalModal when inside QuickAddModal)
 */
export const useBackButtonHandler = (
  id: string,
  isOpen: boolean,
  onClose: () => void,
  priority: number = 50
) => {
  const modalRef = useRef<ModalState | null>(null)

  const registerModal = useCallback(() => {
    if (isOpen) {
      const modal: ModalState = { id, onClose, priority }
      modalRef.current = modal
      addModal(modal)
      startListening()
    }
  }, [id, isOpen, onClose, priority])

  const unregisterModal = useCallback(() => {
    if (modalRef.current) {
      removeModal(modalRef.current.id)
      modalRef.current = null
      stopListening()
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      registerModal()
    } else {
      unregisterModal()
    }

    // Cleanup on unmount
    return () => {
      unregisterModal()
    }
  }, [isOpen, registerModal, unregisterModal])

  // Update modal properties if they change while open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.onClose = onClose
      modalRef.current.priority = priority
      // Re-sort the modals array
      openModals.sort((a, b) => b.priority - a.priority)
    }
  }, [onClose, priority, isOpen])
}

// Export for debugging purposes
export const getOpenModals = () => [...openModals]
