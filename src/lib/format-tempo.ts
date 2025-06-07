export const handleTempoKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
) => {
  if (
    e.key !== 'Backspace' &&
    e.key !== 'Delete' &&
    e.key !== 'ArrowLeft' &&
    e.key !== 'ArrowRight'
  ) {
    const currentValue = e.currentTarget.value.replace(/\D/g, '')
    if (currentValue.length >= 9) {
      e.preventDefault()
    }
  }
}

const formatTempo = (value: string): string => {
  // Remove any non-digit characters
  const digits = value.replace(/\D/g, '')

  // Format the digits with hyphens
  if (digits.length <= 1) {
    return digits
  } else if (digits.length <= 2) {
    return `${digits.slice(0, 1)}-${digits.slice(1)}`
  } else {
    return `${digits.slice(0, 1)}-${digits.slice(1, 2)}-${digits.slice(2, 3)}`
  }
}

export const formatTempoInput = (
  e: React.ChangeEvent<HTMLInputElement>,
): string => {
  const rawValue = e.target.value
  // Only allow digits and hyphens
  const sanitizedValue = rawValue.replace(/[^\d-]/g, '')

  // Format the value
  const formattedValue = formatTempo(sanitizedValue)

  return formattedValue
}

export const formatNumberInput = (
  e: React.ChangeEvent<HTMLInputElement>,
): string => {
  const rawValue = e.target.value
  // Remove any non-digit characters
  return rawValue.replace(/\D/g, '')
}

/**
 * Handles keydown event to prevent non-numeric input
 * @param e - React keyboard event for input element
 * @param maxLength - Optional maximum length of the input
 */
