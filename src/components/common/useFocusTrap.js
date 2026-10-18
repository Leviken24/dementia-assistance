import { useEffect, useRef } from 'react';

/**
 * useFocusTrap
 * Reusable React hook that traps keyboard focus inside modal dialogs
 * and handles Escape key dismissal, restoring focus on close.
 *
 * @param {boolean} isActive - Whether the modal dialog is currently open
 * @param {Function} [onEscape] - Callback invoked when Escape key is pressed
 * @returns {React.RefObject} containerRef - Attach to the modal dialog wrapper element
 */
export function useFocusTrap(isActive, onEscape) {
  const containerRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Save triggering element to restore focus when modal closes
    previousActiveElement.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Selector for interactive/focusable elements
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusables = Array.from(container.querySelectorAll(focusableSelector));

    // Focus the first element inside the modal
    if (focusables.length > 0) {
      // Small timeout ensures element is mounted and visible
      const timer = setTimeout(() => {
        focusables[0].focus();
      }, 50);
      return () => clearTimeout(timer);
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key === 'Tab') {
        const currentFocusables = Array.from(container.querySelectorAll(focusableSelector));
        if (currentFocusables.length === 0) return;

        const firstElement = currentFocusables[0];
        const lastElement = currentFocusables[currentFocusables.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: if on first, cycle to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: if on last, cycle to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to previous element when modal unmounts
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, onEscape]);

  return containerRef;
}
