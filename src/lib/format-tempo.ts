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
 * Format number input allowing decimal points
 * Useful for weight, measurements, etc.
 * Accepts both comma and period as decimal separators, converts comma to period
 */
export const formatDecimalInput = (
  e: React.ChangeEvent<HTMLInputElement>,
): string => {
  const rawValue = e.target.value
  // Allow digits, dots, and commas, then normalize comma to dot
  return rawValue
    .replace(/[^\d.,]/g, '') // Allow only digits, dots, and commas
    .replace(/,/g, '.') // Convert all commas to dots
    .replace(/(\..*)\./g, '$1') // Prevent multiple decimal points
}

/**
 * Smart number formatting that only shows decimals when needed
 * @param value - The number to format
 * @param maxDecimals - Maximum decimal places to show
 * @returns Formatted number string without unnecessary decimals
 */
export const formatNumberSmart = (
  value: number | null | undefined,
  maxDecimals: number = 1,
): string => {
  // Handle null, undefined, or non-number values
  if (value == null || typeof value !== 'number' || isNaN(value)) {
    return ''
  }

  // Round to the specified decimal places
  const rounded = Number(value.toFixed(maxDecimals))

  // If the rounded number is the same as the integer version, don't show decimals
  if (rounded === Math.floor(rounded)) {
    return rounded.toString()
  }

  // Otherwise, show the number with decimals, removing trailing zeros
  return rounded.toString()
}

/**
 * Handles keydown event to prevent non-numeric input
 * @param e - React keyboard event for input element
 * @param maxLength - Optional maximum length of the input
 */
