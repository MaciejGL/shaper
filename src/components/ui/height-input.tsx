import { forwardRef, useCallback, useEffect, useId, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useHeightConversion } from '@/hooks/use-height-conversion'
import { cmToFeetInches } from '@/lib/height-utils'

interface HeightInputProps {
  id?: string
  label?: string
  heightInCm?: number | null
  onHeightChange?: (heightInCm: number | null) => void
  showLabel?: boolean
  disabled?: boolean
  className?: string
  placeholder?: string
}

export const HeightInput = forwardRef<HTMLInputElement, HeightInputProps>(
  (
    {
      id,
      label,
      heightInCm,
      onHeightChange,
      showLabel = true,
      disabled = false,
      className,
      placeholder,
    },
    ref,
  ) => {
    const { getHeightLabel, heightUnit } = useHeightConversion()
    const generatedId = useId()

    // For cm: single input value
    // For ft: separate feet and inches
    const [cmValue, setCmValue] = useState('')
    const [feetValue, setFeetValue] = useState('')
    const [inchesValue, setInchesValue] = useState('')

    const updateInputValues = useCallback(() => {
      if (heightInCm == null) {
        setCmValue('')
        setFeetValue('')
        setInchesValue('')
        return
      }

      if (heightUnit === 'cm') {
        setCmValue(heightInCm.toString())
      } else {
        const { feet, inches } = cmToFeetInches(heightInCm)
        setFeetValue(feet.toString())
        setInchesValue(inches.toString())
      }
    }, [heightInCm, heightUnit])

    useEffect(() => {
      updateInputValues()
    }, [heightInCm, heightUnit, updateInputValues])

    const handleCmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setCmValue(value)

      if (value === '' || value === null) {
        onHeightChange?.(null)
        return
      }

      const parsed = parseFloat(value)
      if (!isNaN(parsed)) {
        onHeightChange?.(Math.round(parsed))
      }
    }

    const handleFeetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setFeetValue(value)
      updateFtInHeight(value, inchesValue)
    }

    const handleInchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInchesValue(value)
      updateFtInHeight(feetValue, value)
    }

    const updateFtInHeight = (feet: string, inches: string) => {
      if (feet === '' && inches === '') {
        onHeightChange?.(null)
        return
      }

      const feetNum = parseInt(feet) || 0
      const inchesNum = parseInt(inches) || 0

      // Validate inches (must be 0-11)
      if (inchesNum >= 12) {
        return // Don't update if inches is invalid
      }

      if (feetNum >= 0 && inchesNum >= 0) {
        const totalInches = feetNum * 12 + inchesNum
        const cm = Math.round(totalInches * 2.54)
        onHeightChange?.(cm)
      }
    }

    const finalLabel = label || getHeightLabel()
    const inputId = id || generatedId

    if (heightUnit === 'cm') {
      return (
        <div className="space-y-2">
          {showLabel && (
            <Label htmlFor={inputId} className="text-sm">
              {finalLabel}
            </Label>
          )}
          <div className="relative">
            <Input
              ref={ref}
              id={inputId}
              value={cmValue}
              onChange={handleCmChange}
              disabled={disabled}
              className={className}
              placeholder={placeholder || 'e.g. 175'}
              iconEnd={
                <div className="text-sm text-muted-foreground pointer-events-none">
                  cm
                </div>
              }
            />
          </div>
        </div>
      )
    }

    // Feet/Inches mode with separate inputs
    return (
      <div className="space-y-2">
        {showLabel && <Label className="text-sm">{finalLabel}</Label>}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              ref={ref}
              id={inputId}
              value={feetValue}
              onChange={handleFeetChange}
              disabled={disabled}
              className={className}
              placeholder="5"
              iconEnd={
                <div className="text-sm text-muted-foreground pointer-events-none">
                  ft
                </div>
              }
            />
          </div>
          <div className="flex-1">
            <Input
              id={`${inputId}-inches`}
              value={inchesValue}
              onChange={handleInchesChange}
              disabled={disabled}
              className={className}
              placeholder="10"
              iconEnd={
                <div className="text-sm text-muted-foreground pointer-events-none">
                  in
                </div>
              }
            />
          </div>
        </div>
      </div>
    )
  },
)

HeightInput.displayName = 'HeightInput'
