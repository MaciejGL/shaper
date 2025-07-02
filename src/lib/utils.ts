import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Number formatting utilities for charts
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('no-NB', {
    maximumFractionDigits: decimals,
  })
}

export function formatWeight(value: number, decimals: number = 1): string {
  return `${formatNumber(value, decimals)} kg`
}

export function formatSets(value: number): string {
  return Math.round(value).toString()
}
