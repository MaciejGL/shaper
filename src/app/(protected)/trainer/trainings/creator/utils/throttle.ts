// Throttle function with cleanup capability
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null
  let lastExecTime = 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const throttledFunc = ((...args: any[]) => {
    const currentTime = Date.now()

    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(
        () => {
          func(...args)
          lastExecTime = Date.now()
        },
        delay - (currentTime - lastExecTime),
      )
    }
  }) as T & { cancel: () => void }

  throttledFunc.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return throttledFunc
}
