/**
 * Finds the main scrollable container element in the app
 */
function getScrollableContainer(): Element | null {
  // Look for the main scrollable container which has overflow-y-auto class
  // This is the div inside the Main component that actually scrolls
  return document.querySelector('.overflow-y-auto')
}

/**
 * Smoothly scrolls to the top of the scrollable container
 */
export function scrollToTop() {
  const container = getScrollableContainer()
  if (container) {
    container.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  } else {
    // Fallback to window scroll if container not found
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}
