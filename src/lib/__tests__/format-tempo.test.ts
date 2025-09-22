/**
 * Tests for format-tempo utility functions
 */
import { vi } from 'vitest'

import {
  formatDecimalInput,
  formatNumberInput,
  formatNumberSmart,
  formatTempoInput,
  handleTempoKeyDown,
} from '../format-tempo'

// Helper function to create mock React change events
const createMockChangeEvent = (
  value: string,
): React.ChangeEvent<HTMLInputElement> => {
  return {
    target: {
      value,
    },
  } as React.ChangeEvent<HTMLInputElement>
}

// Helper function to create mock React keyboard events
const createMockKeyboardEvent = (
  key: string,
  currentValue: string = '',
  preventDefault: ReturnType<typeof vi.fn> = vi.fn(),
): React.KeyboardEvent<HTMLInputElement> => {
  return {
    key,
    currentTarget: {
      value: currentValue,
    },
    preventDefault,
  } as unknown as React.KeyboardEvent<HTMLInputElement>
}

describe('Format Tempo Utilities', () => {
  describe('formatDecimalInput', () => {
    it('should convert comma to period for decimal input', () => {
      const event = createMockChangeEvent('72,5')
      expect(formatDecimalInput(event)).toBe('72.5')
    })

    it('should preserve period for decimal input', () => {
      const event = createMockChangeEvent('72.5')
      expect(formatDecimalInput(event)).toBe('72.5')
    })

    it('should handle multiple commas by converting all to single period', () => {
      const event = createMockChangeEvent('72,,5')
      expect(formatDecimalInput(event)).toBe('72.5')
    })

    it('should prevent multiple decimal points', () => {
      const event = createMockChangeEvent('72.5.3')
      expect(formatDecimalInput(event)).toBe('72.53')
    })

    it('should handle trailing comma', () => {
      const event = createMockChangeEvent('72,')
      expect(formatDecimalInput(event)).toBe('72.')
    })

    it('should handle trailing period', () => {
      const event = createMockChangeEvent('72.')
      expect(formatDecimalInput(event)).toBe('72.')
    })

    it('should remove non-numeric characters except commas and periods', () => {
      const event = createMockChangeEvent('abc72,5def')
      expect(formatDecimalInput(event)).toBe('72.5')
    })

    it('should handle empty input', () => {
      const event = createMockChangeEvent('')
      expect(formatDecimalInput(event)).toBe('')
    })

    it('should handle only digits', () => {
      const event = createMockChangeEvent('725')
      expect(formatDecimalInput(event)).toBe('725')
    })

    it('should handle large numbers with decimals', () => {
      const event = createMockChangeEvent('100,25')
      expect(formatDecimalInput(event)).toBe('100.25')
    })

    it('should handle mixed separators correctly', () => {
      const event = createMockChangeEvent('12,34.56')
      expect(formatDecimalInput(event)).toBe('12.3456')
    })
  })

  describe('formatNumberInput', () => {
    it('should remove all non-digit characters', () => {
      const event = createMockChangeEvent('abc123def')
      expect(formatNumberInput(event)).toBe('123')
    })

    it('should remove decimal points', () => {
      const event = createMockChangeEvent('12.5')
      expect(formatNumberInput(event)).toBe('125')
    })

    it('should remove commas', () => {
      const event = createMockChangeEvent('1,000')
      expect(formatNumberInput(event)).toBe('1000')
    })

    it('should handle empty input', () => {
      const event = createMockChangeEvent('')
      expect(formatNumberInput(event)).toBe('')
    })

    it('should preserve only digits', () => {
      const event = createMockChangeEvent('12345')
      expect(formatNumberInput(event)).toBe('12345')
    })

    it('should remove special characters', () => {
      const event = createMockChangeEvent('1-2+3*4/5')
      expect(formatNumberInput(event)).toBe('12345')
    })
  })

  describe('formatNumberSmart', () => {
    it('should format whole numbers without decimals', () => {
      expect(formatNumberSmart(72)).toBe('72')
      expect(formatNumberSmart(100)).toBe('100')
      expect(formatNumberSmart(0)).toBe('0')
    })

    it('should format decimal numbers with necessary decimals only', () => {
      expect(formatNumberSmart(72.5)).toBe('72.5')
      expect(formatNumberSmart(100.25)).toBe('100.3') // Rounded to 1 decimal
      expect(formatNumberSmart(72.1)).toBe('72.1')
    })

    it('should respect maxDecimals parameter', () => {
      expect(formatNumberSmart(72.555, 2)).toBe('72.56') // Rounded to 2 decimals
      expect(formatNumberSmart(72.555, 0)).toBe('73') // Rounded to 0 decimals
      expect(formatNumberSmart(72.1, 3)).toBe('72.1') // Shows 1 decimal even with max 3
    })

    it('should handle null and undefined values', () => {
      expect(formatNumberSmart(null)).toBe('')
      expect(formatNumberSmart(undefined)).toBe('')
    })

    it('should handle NaN values', () => {
      expect(formatNumberSmart(NaN)).toBe('')
    })

    it('should handle non-number values', () => {
      expect(formatNumberSmart('string' as unknown as number)).toBe('')
      expect(formatNumberSmart({} as unknown as number)).toBe('')
    })

    it('should handle very small decimal numbers', () => {
      expect(formatNumberSmart(0.1)).toBe('0.1')
      expect(formatNumberSmart(0.01)).toBe('0')
      expect(formatNumberSmart(0.05)).toBe('0.1')
    })

    it('should handle large numbers', () => {
      expect(formatNumberSmart(1000000)).toBe('1000000')
      expect(formatNumberSmart(1000000.5)).toBe('1000000.5')
    })

    it('should round properly', () => {
      expect(formatNumberSmart(72.15)).toBe('72.2')
      expect(formatNumberSmart(72.14)).toBe('72.1')
      expect(formatNumberSmart(72.95)).toBe('73')
    })
  })

  describe('formatTempoInput', () => {
    it('should format single digit tempo', () => {
      const event = createMockChangeEvent('3')
      expect(formatTempoInput(event)).toBe('3')
    })

    it('should format two digit tempo with hyphen', () => {
      const event = createMockChangeEvent('31')
      expect(formatTempoInput(event)).toBe('3-1')
    })

    it('should format three digit tempo with two hyphens', () => {
      const event = createMockChangeEvent('312')
      expect(formatTempoInput(event)).toBe('3-1-2')
    })

    it('should limit to three digits max', () => {
      const event = createMockChangeEvent('31245')
      expect(formatTempoInput(event)).toBe('3-1-2')
    })

    it('should remove non-digit and non-hyphen characters', () => {
      const event = createMockChangeEvent('3a1b2')
      expect(formatTempoInput(event)).toBe('3-1-2')
    })

    it('should handle pre-formatted input with hyphens', () => {
      const event = createMockChangeEvent('3-1-2')
      expect(formatTempoInput(event)).toBe('3-1-2')
    })

    it('should handle empty input', () => {
      const event = createMockChangeEvent('')
      expect(formatTempoInput(event)).toBe('')
    })

    it('should handle mixed characters', () => {
      const event = createMockChangeEvent('a3b-1c2d')
      expect(formatTempoInput(event)).toBe('3-1-2')
    })
  })

  describe('handleTempoKeyDown', () => {
    it('should prevent input when tempo is at maximum length (9 digits)', () => {
      const preventDefault = vi.fn()
      const event = createMockKeyboardEvent('1', '123456789', preventDefault)

      handleTempoKeyDown(event)

      expect(preventDefault).toHaveBeenCalled()
    })

    it('should allow input when tempo is under maximum length', () => {
      const preventDefault = vi.fn()
      const event = createMockKeyboardEvent('1', '12345678', preventDefault)

      handleTempoKeyDown(event)

      expect(preventDefault).not.toHaveBeenCalled()
    })

    it('should allow navigation keys even at maximum length', () => {
      const preventDefault = vi.fn()
      const navigationKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight']

      navigationKeys.forEach((key) => {
        const event = createMockKeyboardEvent(key, '123456789', preventDefault)
        handleTempoKeyDown(event)
        expect(preventDefault).not.toHaveBeenCalled()
      })
    })

    it('should handle input with non-digit characters in current value', () => {
      const preventDefault = vi.fn()
      const event = createMockKeyboardEvent('1', '12-34-567', preventDefault) // 7 digits

      handleTempoKeyDown(event)

      expect(preventDefault).not.toHaveBeenCalled()
    })

    it('should prevent input when current value has 9 digits (ignoring non-digits)', () => {
      const preventDefault = vi.fn()
      const event = createMockKeyboardEvent(
        '1',
        '1-2-3-4-5-6-7-8-9',
        preventDefault,
      ) // 9 digits

      handleTempoKeyDown(event)

      expect(preventDefault).toHaveBeenCalled()
    })

    it('should handle empty current value', () => {
      const preventDefault = vi.fn()
      const event = createMockKeyboardEvent('1', '', preventDefault)

      handleTempoKeyDown(event)

      expect(preventDefault).not.toHaveBeenCalled()
    })
  })
})
