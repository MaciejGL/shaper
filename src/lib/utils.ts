import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Number formatting utilities for charts
export function formatNumber(value: number, decimals: number = 0): string {
  // Use Norwegian locale first to get the space thousands separator
  const norwegianFormatted = value.toLocaleString('no-NB', {
    maximumFractionDigits: decimals,
  })

  // Replace comma with period for decimal separator
  return norwegianFormatted.replace(',', '.')
}

export function formatWeight(value: number, decimals: number = 1): string {
  return `${formatNumber(value, decimals)} kg`
}

export function formatSets(value: number): string {
  return Math.round(value).toString()
}
